import type { Prompt, PromptFilter } from '$lib/types/index.js';
import { appStore } from './app.svelte.js';

function createPromptsStore() {
  let activePromptId = $state<string | null>(null);
  let isEditing = $state<boolean>(false);

  let filter = $state<PromptFilter>({
    searchQuery: '',
    tags: [],
    favoritesOnly: false,
    sortField: 'updatedAt',
    sortDirection: 'desc',
  });

  const activePrompt = $derived<Prompt | null>(
    activePromptId ? (appStore.prompts.find((p) => p.id === activePromptId) ?? null) : null
  );

  const filteredPrompts = $derived.by<Prompt[]>(() => {
    let result = appStore.prompts;

    if (filter.searchQuery.trim()) {
      const query = filter.searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.content.toLowerCase().includes(query) ||
          (p.tags ?? []).some((t) => t.toLowerCase().includes(query))
      );
    }

    if (filter.tags.length > 0) {
      result = result.filter((p) => filter.tags.some((t) => (p.tags ?? []).includes(t)));
    }

    if (filter.favoritesOnly) {
      result = result.filter((p) => p.isFavorite);
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
    for (const prompt of appStore.prompts) {
      for (const tag of (prompt.tags ?? [])) {
        tagSet.add(tag);
      }
    }
    return [...tagSet].sort();
  });

  return {
    get activePromptId() { return activePromptId; },
    get activePrompt() { return activePrompt; },
    get isEditing() { return isEditing; },
    get filter() { return filter; },
    get filteredPrompts() { return filteredPrompts; },
    get allTags() { return allTags; },

    setActivePrompt(id: string | null): void {
      activePromptId = id;
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

    setSortField(field: PromptFilter['sortField']): void {
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

    createPrompt(): string {
      const now = new Date().toISOString();
      const id = crypto.randomUUID();
      const newPrompt: Prompt = {
        id,
        title: 'Untitled Prompt',
        content: '',
        tags: [],
        createdAt: now,
        updatedAt: now,
        isFavorite: false,
      };
      appStore.addPrompt(newPrompt);
      activePromptId = id;
      isEditing = true;
      return id;
    },

    toggleFavorite(id: string): void {
      const prompt = appStore.prompts.find((p) => p.id === id);
      if (prompt) {
        appStore.updatePrompt(id, { isFavorite: !prompt.isFavorite });
      }
    },

    duplicatePrompt(id: string): string | null {
      const source = appStore.prompts.find((p) => p.id === id);
      if (!source) return null;

      const now = new Date().toISOString();
      const newId = crypto.randomUUID();
      const duplicate: Prompt = {
        ...structuredClone($state.snapshot(source)),
        id: newId,
        title: `${source.title} (copy)`,
        createdAt: now,
        updatedAt: now,
      };
      appStore.addPrompt(duplicate);
      return newId;
    },
  };
}

export const promptsStore = createPromptsStore();
