import type { Note, NoteFilter, NoteCategory, ClaudeMessage } from '$lib/types/index.js';
import { DEFAULT_CATEGORIES } from '$lib/types/index.js';
import { appStore } from './app.svelte.js';
import { loadFromStorage, saveToStorage } from '$lib/utils/local-storage.js';

function createNotesStore() {
  let activeNoteId = $state<string | null>(null);
  let isEditing = $state<boolean>(false);
  let showClaudePanel = $state<boolean>(false);
  let claudeMessages = $state<ClaudeMessage[]>([]);
  let claudeMessagesByNote = $state<Record<string, ClaudeMessage[]>>(
    loadFromStorage('cortex:claude-messages', {})
  );

  let categories = $state<NoteCategory[]>(
    loadFromStorage('cortex:note-categories', DEFAULT_CATEGORIES)
  );

  let filter = $state<NoteFilter>({
    searchQuery: '',
    category: null,
    tags: [],
    favoritesOnly: false,
    sortField: 'updatedAt',
    sortDirection: 'desc',
  });

  const activeNote = $derived<Note | null>(
    activeNoteId ? (appStore.notes.find((n) => n.id === activeNoteId) ?? null) : null
  );

  const filteredNotes = $derived.by<Note[]>(() => {
    let result = appStore.notes;

    if (filter.searchQuery.trim()) {
      const query = filter.searchQuery.toLowerCase();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(query) ||
          n.content.toLowerCase().includes(query) ||
          (n.tags ?? []).some((t) => t.toLowerCase().includes(query))
      );
    }

    if (filter.category !== null) {
      result = result.filter((n) => n.category === filter.category);
    }

    if (filter.tags.length > 0) {
        result = result.filter((n) => filter.tags.some((t) => (n.tags ?? []).includes(t)));
    }

    if (filter.favoritesOnly) {
      result = result.filter((n) => n.isFavorite);
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
    for (const note of appStore.notes) {
      for (const tag of (note.tags ?? [])) {
        tagSet.add(tag);
      }
    }
    return [...tagSet].sort();
  });

  return {
    get activeNoteId() { return activeNoteId; },
    get activeNote() { return activeNote; },
    get isEditing() { return isEditing; },
    get showClaudePanel() { return showClaudePanel; },
    get claudeMessages() { return claudeMessages; },
    get categories() { return categories; },
    get filter() { return filter; },
    get filteredNotes() { return filteredNotes; },
    get allTags() { return allTags; },

    setActiveNote(id: string | null): void {
      // Save current note's messages before switching
      if (activeNoteId && claudeMessages.length > 0) {
        claudeMessagesByNote[activeNoteId] = [...claudeMessages];
        saveToStorage('cortex:claude-messages', claudeMessagesByNote);
      }
      activeNoteId = id;
      isEditing = id !== null;
      // Restore messages for the target note
      claudeMessages = id ? [...(claudeMessagesByNote[id] ?? [])] : [];
      // Keep showClaudePanel as-is so the panel stays open when switching notes
    },

    toggleClaudePanel(): void {
      showClaudePanel = !showClaudePanel;
    },

    addClaudeMessage(message: ClaudeMessage): void {
      claudeMessages.push(message);
      if (activeNoteId) {
        claudeMessagesByNote[activeNoteId] = [...claudeMessages];
        saveToStorage('cortex:claude-messages', claudeMessagesByNote);
      }
    },

    clearClaudeMessages(): void {
      claudeMessages = [];
      if (activeNoteId) {
        delete claudeMessagesByNote[activeNoteId];
        saveToStorage('cortex:claude-messages', claudeMessagesByNote);
      }
    },

    setSearchQuery(query: string): void {
      filter.searchQuery = query;
    },

    setCategoryFilter(categoryId: string | null): void {
      filter.category = categoryId;
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

    setSortField(field: NoteFilter['sortField']): void {
      filter.sortField = field;
    },

    toggleSortDirection(): void {
      filter.sortDirection = filter.sortDirection === 'asc' ? 'desc' : 'asc';
    },

    clearFilters(): void {
      filter.searchQuery = '';
      filter.category = null;
      filter.tags = [];
      filter.favoritesOnly = false;
      filter.sortField = 'updatedAt';
      filter.sortDirection = 'desc';
    },

    clearTagFilters(): void {
      filter.tags = [];
    },

    createNote(): string {
      const now = new Date().toISOString();
      const id = crypto.randomUUID();
      const newNote: Note = {
        id,
        title: 'Untitled Note',
        content: '',
        category: 'general',
        tags: [],
        createdAt: now,
        updatedAt: now,
        isFavorite: false,
      };
      appStore.addNote(newNote);
      activeNoteId = id;
      isEditing = true;
      return id;
    },

    toggleFavorite(id: string): void {
      const note = appStore.notes.find((n) => n.id === id);
      if (note) {
        appStore.updateNote(id, { isFavorite: !note.isFavorite });
      }
    },

    duplicateNote(id: string): string | null {
      const source = appStore.notes.find((n) => n.id === id);
      if (!source) return null;

      const now = new Date().toISOString();
      const newId = crypto.randomUUID();
      const duplicate: Note = {
        ...structuredClone($state.snapshot(source)),
        id: newId,
        title: `${source.title} (copy)`,
        createdAt: now,
        updatedAt: now,
      };
      appStore.addNote(duplicate);
      return newId;
    },

    addCategory(category: NoteCategory): void {
      categories.push(category);
      saveToStorage('cortex:note-categories', categories);
    },

    removeCategory(id: string): void {
      categories = categories.filter((c) => c.id !== id);
      saveToStorage('cortex:note-categories', categories);
    },
  };
}

export const notesStore = createNotesStore();
