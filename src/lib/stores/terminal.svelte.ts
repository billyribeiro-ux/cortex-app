import type { TerminalItem, TerminalFilter } from '$lib/types/index.js';
import { appStore } from './app.svelte.js';

function createTerminalStore() {
  let activeTerminalId = $state<string | null>(null);
  let isEditing = $state<boolean>(false);

  let filter = $state<TerminalFilter>({
    searchQuery: '',
    tags: [],
    favoritesOnly: false,
    sortField: 'updatedAt',
    sortDirection: 'desc',
  });

  const activeTerminal = $derived<TerminalItem | null>(
    activeTerminalId ? (appStore.terminal.find((x) => x.id === activeTerminalId) ?? null) : null
  );

  const filteredTerminal = $derived.by<TerminalItem[]>(() => {
    let result = appStore.terminal;

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
    for (const item of appStore.terminal) {
      for (const tag of (item.tags ?? [])) {
        tagSet.add(tag);
      }
    }
    return [...tagSet].sort();
  });

  return {
    get activeTerminalId() { return activeTerminalId; },
    get activeTerminal() { return activeTerminal; },
    get isEditing() { return isEditing; },
    get filter() { return filter; },
    get filteredTerminal() { return filteredTerminal; },
    get allTags() { return allTags; },

    setActiveTerminal(id: string | null): void {
      activeTerminalId = id;
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

    setSortField(field: TerminalFilter['sortField']): void {
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

    createTerminal(): string {
      const now = new Date().toISOString();
      const id = crypto.randomUUID();
      const newItem: TerminalItem = {
        id,
        title: 'Untitled Terminal',
        content: '',
        tags: [],
        createdAt: now,
        updatedAt: now,
        isFavorite: false,
      };
      appStore.addTerminal(newItem);
      activeTerminalId = id;
      isEditing = true;
      return id;
    },

    toggleFavorite(id: string): void {
      const item = appStore.terminal.find((x) => x.id === id);
      if (item) {
        appStore.updateTerminal(id, { isFavorite: !item.isFavorite });
      }
    },

    duplicateTerminal(id: string): string | null {
      const source = appStore.terminal.find((x) => x.id === id);
      if (!source) return null;

      const now = new Date().toISOString();
      const newId = crypto.randomUUID();
      const duplicate: TerminalItem = {
        ...structuredClone($state.snapshot(source)),
        id: newId,
        title: `${source.title} (copy)`,
        createdAt: now,
        updatedAt: now,
      };
      appStore.addTerminal(duplicate);
      return newId;
    },
  };
}

export const terminalStore = createTerminalStore();
