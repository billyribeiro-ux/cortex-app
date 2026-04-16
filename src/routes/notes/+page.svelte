<script lang="ts">
  import { appStore } from '$lib/stores/app.svelte.js';
  import { notesStore } from '$lib/stores/notes.svelte.js';
  import NoteListItem from '$lib/components/notes/NoteListItem.svelte';
  import NoteFilters from '$lib/components/notes/NoteFilters.svelte';
  import NoteEditor from '$lib/components/notes/NoteEditor.svelte';
  import ClaudePanel from '$lib/components/notes/ClaudePanel.svelte';
  import Icon from '@iconify/svelte';
  import { fly } from 'svelte/transition';

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
          <div class="empty-state" in:fly={{ y: 20, duration: 400, delay: 100 }}>
            <div class="empty-icon-wrap">
              <Icon icon="ph:note" width={32} height={32} />
            </div>
            <div class="empty-text">
              <h3>No notes yet</h3>
              <p class="empty-sub">Create your first note!</p>
            </div>
          </div>
        {:else if notesStore.filteredNotes.length === 0}
          <div class="empty-state" in:fly={{ y: 20, duration: 400 }}>
            <div class="empty-icon-wrap">
              <Icon icon="ph:funnel" width={32} height={32} />
            </div>
            <div class="empty-text">
              <h3>No notes found</h3>
              <p class="empty-sub">Try adjusting your filters.</p>
            </div>
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
        <div class="no-note-state" in:fly={{ y: 20, duration: 400, delay: 150 }}>
          <div class="empty-icon-wrap-large">
            <Icon icon="ph:note-pencil" width={48} height={48} />
          </div>
          <div class="empty-text">
            <h3>Select a note</h3>
            <p class="empty-sub">Or create a new one to start writing</p>
          </div>
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
    flex: 1;
    overflow: hidden;
    margin: calc(-1 * var(--space-8));
  }

  .notes-body {
    display: flex;
    flex: 1;
    overflow: hidden;
    min-height: 0;
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
    padding: var(--space-3) var(--space-4);
    border-bottom: 1px solid var(--color-border-subtle);
    flex-shrink: 0;
  }

  .new-note-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    width: 100%;
    min-height: 44px;
    padding: var(--space-2) var(--space-3);
    background: var(--color-accent-primary);
    color: #fff;
    border: none;
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    font-weight: var(--weight-semibold);
    letter-spacing: var(--tracking-sm);
    line-height: var(--leading-sm);
    box-shadow: var(--shadow-xs);
    transition:
      background var(--transition-fast),
      box-shadow var(--transition-fast),
      transform 120ms var(--ease-out);
    user-select: none;
    cursor: pointer;
  }

  .new-note-btn:hover {
    background: var(--color-accent-primary-hover);
    box-shadow: var(--shadow-sm);
  }

  .new-note-btn:active {
    transform: scale(0.97);
    box-shadow: var(--shadow-xs);
  }

  .note-list-scroll {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    padding: var(--space-1-5);
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-4);
    padding: var(--space-8) var(--space-4);
    text-align: center;
    flex: 1;
  }

  .empty-icon-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    border-radius: var(--radius-full);
    background: var(--color-bg-tertiary);
    color: var(--color-text-tertiary);
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
  }

  .empty-text {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .empty-text h3 {
    font-size: var(--text-base);
    font-weight: var(--weight-semibold);
    color: var(--color-text-primary);
    margin: 0;
  }

  .empty-sub {
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    color: var(--color-text-tertiary);
    letter-spacing: var(--tracking-xs);
    margin: 0;
  }

  .clear-filters-btn {
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    color: var(--color-accent-primary);
    background: none;
    border: none;
    text-decoration: underline;
    text-underline-offset: 2px;
    margin-top: var(--space-1);
    cursor: pointer;
    transition: color var(--transition-fast);
  }

  .clear-filters-btn:hover {
    color: var(--color-accent-primary-hover);
  }

  /* Center Panel */
  .editor-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-width: 0;
    border-left: 1px solid var(--color-border-subtle);
  }

  .no-note-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-6);
    height: 100%;
    text-align: center;
  }

  .empty-icon-wrap-large {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    border-radius: var(--radius-full);
    background: var(--color-bg-tertiary);
    color: var(--color-text-tertiary);
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
  }

  .no-note-state .empty-text h3 {
    font-size: var(--text-lg);
  }

  .no-note-state .empty-sub {
    font-size: var(--text-sm);
  }

  .new-note-btn-center {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    min-height: 44px;
    padding: var(--space-2) var(--space-5);
    background: var(--color-accent-primary);
    color: #fff;
    border: none;
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    font-weight: var(--weight-semibold);
    letter-spacing: var(--tracking-sm);
    line-height: var(--leading-sm);
    box-shadow: var(--shadow-xs);
    cursor: pointer;
    transition:
      background var(--transition-fast),
      box-shadow var(--transition-fast),
      transform 120ms var(--ease-out);
    user-select: none;
  }

  .new-note-btn-center:hover {
    background: var(--color-accent-primary-hover);
    box-shadow: var(--shadow-sm);
  }

  .new-note-btn-center:active {
    transform: scale(0.97);
    box-shadow: var(--shadow-xs);
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
