import type { VercelItem, VercelFilter } from '$lib/types/index.js';
import { appStore } from './app.svelte.js';

function createVercelStore() {
  let activeVercelId = $state<string | null>(null);
  let isEditing = $state<boolean>(false);

  let filter = $state<VercelFilter>({
    searchQuery: '',
    tags: [],
    favoritesOnly: false,
    sortField: 'updatedAt',
    sortDirection: 'desc',
  });

  const activeVercel = $derived<VercelItem | null>(
    activeVercelId ? (appStore.vercel.find((x) => x.id === activeVercelId) ?? null) : null
  );

  const filteredVercel = $derived.by<VercelItem[]>(() => {
    let result = appStore.vercel;

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
    for (const item of appStore.vercel) {
      for (const tag of (item.tags ?? [])) {
        tagSet.add(tag);
      }
    }
    return [...tagSet].sort();
  });

  return {
    get activeVercelId() { return activeVercelId; },
    get activeVercel() { return activeVercel; },
    get isEditing() { return isEditing; },
    get filter() { return filter; },
    get filteredVercel() { return filteredVercel; },
    get allTags() { return allTags; },

    setActiveVercel(id: string | null): void {
      activeVercelId = id;
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

    setSortField(field: VercelFilter['sortField']): void {
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

    createVercel(): string {
      const now = new Date().toISOString();
      const id = crypto.randomUUID();
      const newItem: VercelItem = {
        id,
        title: 'Untitled Vercel',
        content: '',
        tags: [],
        createdAt: now,
        updatedAt: now,
        isFavorite: false,
      };
      appStore.addVercel(newItem);
      activeVercelId = id;
      isEditing = true;
      return id;
    },

    toggleFavorite(id: string): void {
      const item = appStore.vercel.find((x) => x.id === id);
      if (item) {
        appStore.updateVercel(id, { isFavorite: !item.isFavorite });
      }
    },

    duplicateVercel(id: string): string | null {
      const source = appStore.vercel.find((x) => x.id === id);
      if (!source) return null;

      const now = new Date().toISOString();
      const newId = crypto.randomUUID();
      const duplicate: VercelItem = {
        ...structuredClone($state.snapshot(source)),
        id: newId,
        title: `${source.title} (copy)`,
        createdAt: now,
        updatedAt: now,
      };
      appStore.addVercel(duplicate);
      return newId;
    },
  };
}

export const vercelStore = createVercelStore();
