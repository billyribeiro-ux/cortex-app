<script lang="ts">
  import { appStore } from '$lib/stores/app.svelte.js';
  import { notesStore } from '$lib/stores/notes.svelte.js';
  import NoteListItem from '$lib/components/notes/NoteListItem.svelte';
  import NoteFilters from '$lib/components/notes/NoteFilters.svelte';
  import NoteEditor from '$lib/components/notes/NoteEditor.svelte';
  import ClaudePanel from '$lib/components/notes/ClaudePanel.svelte';
  import Icon from '@iconify/svelte';

  let searchInputEl = $state<HTMLInputElement | null>(null);
  let editorRef = $state<{ handleForceSave: () => void } | null>(null);

  // Sync TopBar search → notes filter
  $effect(() => {
    notesStore.setSearchQuery(appStore.searchQuery);
  });

  function handleNewNote(): void {
    notesStore.createNote();
  }

  function handleKeydown(e: KeyboardEvent): void {
    const isMod = e.metaKey || e.ctrlKey;

    if (isMod && e.key === 'n') {
      e.preventDefault();
      handleNewNote();
    } else if (isMod && e.key === 'f') {
      e.preventDefault();
      const searchEl = document.querySelector<HTMLInputElement>('.filters-bar .search-input');
      searchEl?.focus();
    } else if (isMod && e.key === 'k') {
      e.preventDefault();
      notesStore.toggleClaudePanel();
    } else if (isMod && e.key === 's') {
      e.preventDefault();
      editorRef?.handleForceSave();
    } else if (e.key === 'Escape') {
      notesStore.setActiveNote(null);
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="notes-page">
  <NoteFilters />

  <div class="notes-body">
    <!-- Left: Note List -->
    <aside class="note-list-panel">
      <div class="note-list-header">
        <button class="new-note-btn" onclick={handleNewNote}>
          <Icon icon="ph:plus" width={16} height={16} />
          New Note
        </button>
      </div>

      <div class="note-list-scroll">
        {#if appStore.notes.length === 0}
          <div class="empty-state">
            <Icon icon="ph:note" width={40} height={40} />
            <p>No notes yet.</p>
            <p class="empty-sub">Create your first note!</p>
          </div>
        {:else if notesStore.filteredNotes.length === 0}
          <div class="empty-state">
            <Icon icon="ph:funnel" width={40} height={40} />
            <p>No notes match your filters.</p>
            <button class="clear-filters-btn" onclick={() => notesStore.clearFilters()}>
              Clear filters
            </button>
          </div>
        {:else}
          {#each notesStore.filteredNotes as note (note.id)}
            <NoteListItem
              {note}
              isActive={notesStore.activeNoteId === note.id}
              onclick={() => notesStore.setActiveNote(note.id)}
              onToggleFavorite={() => notesStore.toggleFavorite(note.id)}
            />
          {/each}
        {/if}
      </div>
    </aside>

    <!-- Center: Note Editor -->
    <div class="editor-panel">
      {#if notesStore.activeNote}
        <NoteEditor bind:this={editorRef} note={notesStore.activeNote} />
      {:else}
        <div class="no-note-state">
          <Icon icon="ph:note-pencil" width={48} height={48} />
          <p>Select a note or create a new one</p>
          <button class="new-note-btn-center" onclick={handleNewNote}>
            <Icon icon="ph:plus" width={16} height={16} />
            New Note
          </button>
        </div>
      {/if}
    </div>

    <!-- Right: Claude Panel (conditional) -->
    {#if notesStore.showClaudePanel}
      <ClaudePanel />
    {/if}
  </div>
</div>

<style>
  .notes-page {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  .notes-body {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  /* Left Panel */
  .note-list-panel {
    width: 280px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    background: var(--color-bg-secondary);
    border-right: 1px solid var(--color-border-subtle);
    overflow: hidden;
  }

  .note-list-header {
    padding: var(--space-3) var(--space-3);
    border-bottom: 1px solid var(--color-border-subtle);
    flex-shrink: 0;
  }

  .new-note-btn {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    width: 100%;
    padding: var(--space-2) var(--space-3);
    background: var(--color-accent-primary);
    color: #fff;
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    font-weight: 500;
    transition: background var(--transition-fast);
  }

  .new-note-btn:hover {
    background: var(--color-accent-primary-hover);
  }

  .note-list-scroll {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-2);
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    padding: var(--space-8) var(--space-4);
    text-align: center;
    color: var(--color-text-tertiary);
    height: 100%;
  }

  .empty-state p {
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
  }

  .empty-sub {
    font-size: var(--text-xs);
    color: var(--color-text-tertiary);
  }

  .clear-filters-btn {
    font-size: var(--text-xs);
    color: var(--color-accent-primary);
    text-decoration: underline;
    text-underline-offset: 2px;
    margin-top: var(--space-2);
  }

  /* Center Panel */
  .editor-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-width: 0;
  }

  .no-note-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-4);
    height: 100%;
    color: var(--color-text-tertiary);
    text-align: center;
  }

  .no-note-state p {
    font-size: var(--text-base);
    color: var(--color-text-secondary);
  }

  .new-note-btn-center {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-5);
    background: var(--color-accent-primary);
    color: #fff;
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    font-weight: 500;
    transition: background var(--transition-fast);
  }

  .new-note-btn-center:hover {
    background: var(--color-accent-primary-hover);
  }

  @media (max-width: 900px) {
    .note-list-panel {
      width: 220px;
    }
  }

  @media (max-width: 640px) {
    .note-list-panel {
      width: 180px;
      min-width: 160px;
    }
  }
</style>
