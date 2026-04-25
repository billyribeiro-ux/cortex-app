import type { GithubItem, GithubFilter } from '$lib/types/index.js';
import { appStore } from './app.svelte.js';

function createGithubStore() {
  let activeGithubId = $state<string | null>(null);
  let isEditing = $state<boolean>(false);

  let filter = $state<GithubFilter>({
    searchQuery: '',
    tags: [],
    favoritesOnly: false,
    sortField: 'updatedAt',
    sortDirection: 'desc',
  });

  const activeGithub = $derived<GithubItem | null>(
    activeGithubId ? (appStore.github.find((x) => x.id === activeGithubId) ?? null) : null
  );

  const filteredGithub = $derived.by<GithubItem[]>(() => {
    let result = appStore.github;

    if (filter.searchQuery.trim()) {
      const query = filter.searchQuery.toLowerCase();
      result = result.filter(
        (x) =>
          x.title.toLowerCase().includes(query) ||
          x.content.toLowerCase().includes(query) ||
          (x.tags ?? []).some((t) => t.toLowerCase().includes(query))
      );
    }

    if (filter.tags.length > 0) {
      result = result.filter((x) => filter.tags.some((t) => (x.tags ?? []).includes(t)));
    }

    if (filter.favoritesOnly) {
      result = result.filter((x) => x.isFavorite);
    }

    const sorted = [...result].sort((a, b) => {
      const field = filter.sortField;
      let comparison = 0;

      if (field === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else {
        comparison = new Date(a[field]).getTime() - new Date(b[field]).getTime();
      }

      return filter.sortDirection === 'desc' ? -comparison : comparison;
    });

    return sorted;
  });

  const allTags = $derived.by<string[]>(() => {
    const tagSet = new Set<string>();
    for (const item of appStore.github) {
      for (const tag of (item.tags ?? [])) {
        tagSet.add(tag);
      }
    }
    return [...tagSet].sort();
  });

  return {
    get activeGithubId() { return activeGithubId; },
    get activeGithub() { return activeGithub; },
    get isEditing() { return isEditing; },
    get filter() { return filter; },
    get filteredGithub() { return filteredGithub; },
    get allTags() { return allTags; },

    setActiveGithub(id: string | null): void {
      activeGithubId = id;
      isEditing = id !== null;
    },

    setSearchQuery(query: string): void {
      filter.searchQuery = query;
    },

    toggleTagFilter(tag: string): void {
      const index = filter.tags.indexOf(tag);
      if (index === -1) {
        filter.tags.push(tag);
      } else {
        filter.tags.splice(index, 1);
      }
    },

    setFavoritesOnly(value: boolean): void {
      filter.favoritesOnly = value;
    },

    setSortField(field: GithubFilter['sortField']): void {
      filter.sortField = field;
    },

    toggleSortDirection(): void {
      filter.sortDirection = filter.sortDirection === 'asc' ? 'desc' : 'asc';
    },

    clearFilters(): void {
      filter.searchQuery = '';
      filter.tags = [];
      filter.favoritesOnly = false;
      filter.sortField = 'updatedAt';
      filter.sortDirection = 'desc';
    },

    clearTagFilters(): void {
      filter.tags = [];
    },

    createGithub(): string {
      const now = new Date().toISOString();
      const id = crypto.randomUUID();
      const newItem: GithubItem = {
        id,
        title: 'Untitled GitHub',
        content: '',
        tags: [],
        createdAt: now,
        updatedAt: now,
        isFavorite: false,
      };
      appStore.addGithub(newItem);
      activeGithubId = id;
      isEditing = true;
      return id;
    },

    toggleFavorite(id: string): void {
      const item = appStore.github.find((x) => x.id === id);
      if (item) {
        appStore.updateGithub(id, { isFavorite: !item.isFavorite });
      }
    },

    duplicateGithub(id: string): string | null {
      const source = appStore.github.find((x) => x.id === id);
      if (!source) return null;

      const now = new Date().toISOString();
      const newId = crypto.randomUUID();
      const duplicate: GithubItem = {
        ...structuredClone($state.snapshot(source)),
        id: newId,
        title: `${source.title} (copy)`,
        createdAt: now,
        updatedAt: now,
      };
      appStore.addGithub(duplicate);
      return newId;
    },
  };
}

export const githubStore = createGithubStore();
