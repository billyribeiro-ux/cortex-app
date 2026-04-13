import type { Stack, StackFilter } from '$lib/types/index.js';
import { appStore } from './app.svelte.js';

function createStacksStore() {
  let activeStackId = $state<string | null>(null);
  let isEditing = $state<boolean>(false);

  let filter = $state<StackFilter>({
    searchQuery: '',
    tags: [],
    favoritesOnly: false,
    sortField: 'updatedAt',
    sortDirection: 'desc',
  });

  const activeStack = $derived<Stack | null>(
    activeStackId ? (appStore.stacks.find((s) => s.id === activeStackId) ?? null) : null
  );

  const filteredStacks = $derived.by<Stack[]>(() => {
    let result = appStore.stacks;

    if (filter.searchQuery.trim()) {
      const query = filter.searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(query) ||
          s.content.toLowerCase().includes(query) ||
          (s.tags ?? []).some((t) => t.toLowerCase().includes(query))
      );
    }

    if (filter.tags.length > 0) {
      result = result.filter((s) => filter.tags.some((t) => (s.tags ?? []).includes(t)));
    }

    if (filter.favoritesOnly) {
      result = result.filter((s) => s.isFavorite);
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
    for (const stack of appStore.stacks) {
      for (const tag of (stack.tags ?? [])) {
        tagSet.add(tag);
      }
    }
    return [...tagSet].sort();
  });

  return {
    get activeStackId() { return activeStackId; },
    get activeStack() { return activeStack; },
    get isEditing() { return isEditing; },
    get filter() { return filter; },
    get filteredStacks() { return filteredStacks; },
    get allTags() { return allTags; },

    setActiveStack(id: string | null): void {
      activeStackId = id;
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

    setSortField(field: StackFilter['sortField']): void {
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

    createStack(): string {
      const now = new Date().toISOString();
      const id = crypto.randomUUID();
      const newStack: Stack = {
        id,
        title: 'Untitled Stack',
        content: '',
        tags: [],
        createdAt: now,
        updatedAt: now,
        isFavorite: false,
      };
      appStore.addStack(newStack);
      activeStackId = id;
      isEditing = true;
      return id;
    },

    toggleFavorite(id: string): void {
      const stack = appStore.stacks.find((s) => s.id === id);
      if (stack) {
        appStore.updateStack(id, { isFavorite: !stack.isFavorite });
      }
    },

    duplicateStack(id: string): string | null {
      const source = appStore.stacks.find((s) => s.id === id);
      if (!source) return null;

      const now = new Date().toISOString();
      const newId = crypto.randomUUID();
      const duplicate: Stack = {
        ...structuredClone($state.snapshot(source)),
        id: newId,
        title: `${source.title} (copy)`,
        createdAt: now,
        updatedAt: now,
      };
      appStore.addStack(duplicate);
      return newId;
    },
  };
}

export const stacksStore = createStacksStore();
