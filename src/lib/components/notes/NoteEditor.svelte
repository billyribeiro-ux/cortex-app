<script lang="ts">
  import { onDestroy } from 'svelte';
  import type { Note } from '$lib/types/index.js';
  import { appStore } from '$lib/stores/app.svelte.js';
  import { notesStore } from '$lib/stores/notes.svelte.js';
  import { renderMarkdown } from '$lib/utils/markdown.js';
  import { toastStore } from '$lib/stores/toast.svelte.js';
  import TagInput from '$lib/components/ui/TagInput.svelte';
  import Icon from '@iconify/svelte';

  interface Props {
    note: Note;
  }

  let { note }: Props = $props();

  type ViewMode = 'edit' | 'split' | 'preview';
  let viewMode = $state<ViewMode>('split');
  let deleteConfirm = $state(false);
  let savedFlash = $state(false);

  let debounceTimer = $state<ReturnType<typeof setTimeout> | null>(null);
  let textareaRef = $state<HTMLTextAreaElement | null>(null);
  let titleInputRef = $state<HTMLInputElement | null>(null);
  let saveTrigger = $state(0);
  let lastProcessedSave = $state(0);

  const renderedContent = $derived(renderMarkdown(note.content));

  onDestroy(() => {
    if (debounceTimer !== null) clearTimeout(debounceTimer);
  });

  $effect(() => {
    if (saveTrigger <= lastProcessedSave) return;
    lastProcessedSave = saveTrigger;
    const noteId = notesStore.activeNoteId;
    if (!noteId) return;
    if (debounceTimer !== null) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
    const updates: Partial<Note> = {};
    if (textareaRef) updates.content = textareaRef.value;
    if (titleInputRef) updates.title = titleInputRef.value;
    appStore.updateNote(noteId, Object.keys(updates).length > 0 ? updates : {});
    savedFlash = true;
    setTimeout(() => { savedFlash = false; }, 1500);
  });

  function handleTitleInput(e: Event): void {
    const noteId = notesStore.activeNoteId;
    if (!noteId) return;
    const value = (e.currentTarget as HTMLInputElement).value;
    appStore.updateNote(noteId, { title: value });
  }

  function handleContentInput(e: Event): void {
    const noteId = notesStore.activeNoteId;
    if (!noteId) return;
    const value = (e.currentTarget as HTMLTextAreaElement).value;
    if (debounceTimer !== null) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      appStore.updateNote(noteId, { content: value });
    }, 300);
  }

  function handleTextareaKeydown(e: KeyboardEvent): void {
    if (e.key === 'Tab') {
      e.preventDefault();
      const noteId = notesStore.activeNoteId;
      if (!noteId) return;
      const ta = e.currentTarget as HTMLTextAreaElement;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newValue = ta.value.slice(0, start) + '  ' + ta.value.slice(end);
      appStore.updateNote(noteId, { content: newValue });
      // Restore cursor position after reactive update
      requestAnimationFrame(() => {
        ta.selectionStart = start + 2;
        ta.selectionEnd = start + 2;
      });
    }
  }

  function handleCategorySelect(categoryId: string): void {
    const noteId = notesStore.activeNoteId;
    if (!noteId) return;
    appStore.updateNote(noteId, { category: categoryId });
  }

  function handleAddTag(tag: string): void {
    const noteId = notesStore.activeNoteId;
    if (!noteId) return;
    const current = appStore.notes.find((n) => n.id === noteId);
    if (current) appStore.updateNote(noteId, { tags: [...(current.tags ?? []), tag] });
  }

  function handleRemoveTag(tag: string): void {
    const noteId = notesStore.activeNoteId;
    if (!noteId) return;
    const current = appStore.notes.find((n) => n.id === noteId);
    if (current) appStore.updateNote(noteId, { tags: (current.tags ?? []).filter((t) => t !== tag) });
  }

  function handleToggleFavorite(): void {
    const noteId = notesStore.activeNoteId;
    if (noteId) notesStore.toggleFavorite(noteId);
  }

  function handleDuplicate(): void {
    const noteId = notesStore.activeNoteId;
    if (!noteId) return;
    const newId = notesStore.duplicateNote(noteId);
    if (newId) notesStore.setActiveNote(newId);
  }

  function handleDeleteClick(): void {
    const noteId = notesStore.activeNoteId;
    if (!noteId) return;
    if (deleteConfirm) {
      appStore.deleteNote(noteId);
      notesStore.setActiveNote(null);
      toastStore.success('Note deleted');
      deleteConfirm = false;
    } else {
      deleteConfirm = true;
      setTimeout(() => { deleteConfirm = false; }, 3000);
    }
  }

  // svelte-ignore non_reactive_update — saveTrigger is $state; this is correct
  function handleForceSave(): void {
    saveTrigger++;
  }

  export { handleForceSave };
</script>

<div class="editor-wrap">
  <!-- Editor Header -->
  <div class="editor-header">
    <div class="editor-meta">
      <input
        bind:this={titleInputRef}
        class="title-input selectable"
        type="text"
        placeholder="Untitled Note"
        value={note.title}
        oninput={handleTitleInput}
      />
      <div class="category-pills">
        {#each notesStore.categories as cat}
          <button
            class="cat-pill"
            class:active={note.category === cat.id}
            style:--cat-color={cat.color}
            onclick={() => handleCategorySelect(cat.id)}
            title={cat.name}
          >
            {cat.name}
          </button>
        {/each}
      </div>
      <TagInput tags={note.tags} onAdd={handleAddTag} onRemove={handleRemoveTag} />
    </div>

    <div class="editor-actions">
      <button
        class="action-btn save-btn"
        onclick={handleForceSave}
        aria-label="Save"
        title="Save (⌘S)"
      >
        <Icon icon="ph:floppy-disk" width={16} height={16} />
      </button>
      {#if savedFlash}
        <span class="saved-indicator">Saved</span>
      {/if}

      <div class="view-toggle">
        {#each (['edit', 'split', 'preview'] as ViewMode[]) as mode}
          <button
            class="view-btn"
            class:active={viewMode === mode}
            onclick={() => { viewMode = mode; }}
          >
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </button>
        {/each}
      </div>

      <button
        class="action-btn"
        class:favorited={note.isFavorite}
        onclick={handleToggleFavorite}
        aria-label="Toggle favorite"
        title="Toggle favorite"
      >
        <Icon icon={note.isFavorite ? 'ph:star-fill' : 'ph:star'} width={16} height={16} />
      </button>

      <button class="action-btn" onclick={handleDuplicate} aria-label="Duplicate note" title="Duplicate">
        <Icon icon="ph:copy" width={16} height={16} />
      </button>

      <button
        class="action-btn"
        class:danger={deleteConfirm}
        onclick={handleDeleteClick}
        aria-label={deleteConfirm ? 'Confirm delete' : 'Delete note'}
        title={deleteConfirm ? 'Click again to confirm' : 'Delete note'}
      >
        {#if deleteConfirm}
          <Icon icon="ph:warning" width={16} height={16} />
        {:else}
          <Icon icon="ph:trash" width={16} height={16} />
        {/if}
      </button>

      <button
        class="action-btn claude-btn"
        class:active={notesStore.showClaudePanel}
        onclick={() => notesStore.toggleClaudePanel()}
        aria-label="Toggle Claude panel"
        title="Ask Claude"
      >
        <Icon icon="ph:sparkle" width={16} height={16} />
      </button>
    </div>
  </div>

  <!-- Editor Body -->
  <div class="editor-body" class:split={viewMode === 'split'}>
    {#if viewMode === 'edit' || viewMode === 'split'}
      <textarea
        bind:this={textareaRef}
        class="markdown-textarea selectable"
        class:full={viewMode === 'edit'}
        placeholder="Start writing in Markdown..."
        value={note.content}
        oninput={handleContentInput}
        onkeydown={handleTextareaKeydown}
      ></textarea>
    {/if}

    {#if viewMode === 'preview' || viewMode === 'split'}
      <div
        class="markdown-preview selectable"
        class:full={viewMode === 'preview'}
      >
        {#if note.content.trim()}
          <!-- eslint-disable-next-line svelte/no-at-html-tags -->
          {@html renderedContent}
        {:else}
          <p class="preview-empty">Nothing to preview yet. Start writing in the editor.</p>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  .editor-wrap {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  .editor-header {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    padding: var(--space-5) var(--space-8);
    border-bottom: 1px solid var(--color-border-subtle);
    flex-shrink: 0;
    background: var(--color-bg-secondary);
  }

  .editor-meta {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .title-input {
    font-size: var(--text-2xl);
    font-weight: var(--weight-bold);
    color: var(--color-text-primary);
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    border-radius: 0;
    padding: 0;
    width: 100%;
    letter-spacing: var(--tracking-2xl);
    line-height: var(--leading-sm);
    transition: border-color var(--transition-fast);
  }

  .title-input:focus {
    outline: none;
    border-bottom-color: var(--color-accent-primary);
  }

  .title-input::placeholder {
    color: var(--color-text-tertiary);
  }

  .category-pills {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1-5);
  }

  .cat-pill {
    padding: var(--space-0-5) var(--space-3);
    border-radius: var(--radius-full);
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    border: 1px solid var(--cat-color, var(--color-accent-primary));
    color: var(--cat-color, var(--color-accent-primary));
    background: transparent;
    cursor: pointer;
    transition:
      background var(--transition-fast),
      color var(--transition-fast),
      opacity var(--transition-fast),
      transform 120ms var(--ease-spring);
    opacity: 0.55;
    letter-spacing: var(--tracking-xs);
    line-height: var(--leading-sm);
  }

  .cat-pill:hover {
    opacity: 0.85;
    background: color-mix(in srgb, var(--cat-color, var(--color-accent-primary)) 12%, transparent);
  }

  .cat-pill:active {
    transform: scale(0.96);
  }

  .cat-pill.active {
    background: color-mix(in srgb, var(--cat-color, var(--color-accent-primary)) 18%, transparent);
    color: var(--cat-color, var(--color-accent-primary));
    opacity: 1;
    border-color: color-mix(in srgb, var(--cat-color, var(--color-accent-primary)) 50%, transparent);
  }

  .editor-actions {
    display: flex;
    align-items: center;
    gap: var(--space-1-5);
    flex-shrink: 0;
  }

  .saved-indicator {
    font-size: var(--text-xs);
    color: var(--color-accent-success);
    font-weight: var(--weight-medium);
    margin-right: var(--space-2);
    letter-spacing: var(--tracking-xs);
  }

  .view-toggle {
    display: flex;
    background: var(--color-bg-tertiary);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-md);
    overflow: hidden;
    margin-right: var(--space-2);
    padding: 2px;
    gap: 2px;
  }

  .view-btn {
    padding: var(--space-1) var(--space-3);
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    color: var(--color-text-tertiary);
    border: none;
    background: none;
    border-radius: var(--radius-sm);
    cursor: pointer;
    letter-spacing: var(--tracking-xs);
    transition:
      background var(--transition-fast),
      color var(--transition-fast),
      box-shadow var(--transition-fast);
  }

  .view-btn:hover {
    color: var(--color-text-secondary);
  }

  .view-btn.active {
    background: var(--color-bg-elevated);
    color: var(--color-text-primary);
    box-shadow: var(--shadow-xs);
  }

  .action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    background: none;
    border-radius: var(--radius-md);
    color: var(--color-text-tertiary);
    cursor: pointer;
    transition:
      background var(--transition-fast),
      color var(--transition-fast),
      transform 120ms var(--ease-out);
  }

  .action-btn:hover {
    background: var(--color-bg-hover);
    color: var(--color-text-primary);
  }

  .action-btn:active {
    transform: scale(0.92);
  }

  .action-btn.favorited {
    color: var(--color-accent-warning);
  }

  .action-btn.favorited:hover {
    background: var(--color-bg-hover);
    color: var(--color-accent-warning);
  }

  .action-btn.danger {
    color: var(--color-accent-danger);
    background: var(--color-accent-danger-muted);
  }

  .action-btn.danger:hover {
    background: var(--color-accent-danger-muted);
  }

  .action-btn.save-btn {
    color: var(--color-accent-success);
  }

  .action-btn.save-btn:hover {
    background: var(--color-bg-hover);
    color: var(--color-accent-primary);
  }

  .action-btn.claude-btn.active {
    color: var(--color-accent-primary);
    background: var(--color-accent-primary-muted);
  }

  .editor-body {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  .editor-body.split {
    gap: 0;
  }

  .markdown-textarea {
    flex: 1;
    padding: var(--space-8);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    line-height: var(--leading-base);
    color: var(--color-text-primary);
    background: var(--color-bg-primary);
    border: none;
    border-right: 1px solid var(--color-border-subtle);
    resize: none;
    outline: none;
    overflow-y: auto;
    tab-size: 2;
  }

  .markdown-textarea.full {
    border-right: none;
  }

  .markdown-textarea::placeholder {
    color: var(--color-text-quaternary);
  }

  .markdown-preview {
    flex: 1;
    padding: var(--space-8);
    overflow-y: auto;
    background: var(--color-bg-primary);
    line-height: var(--leading-base);
  }

  .preview-empty {
    color: var(--color-text-tertiary);
    font-style: italic;
    font-size: var(--text-sm);
    line-height: var(--leading-base);
  }

  /* Markdown preview styles */
  .markdown-preview :global(h1) {
    font-size: var(--text-3xl);
    font-weight: var(--weight-bold);
    margin: var(--space-6) 0 var(--space-3);
    letter-spacing: var(--tracking-2xl);
    color: var(--color-text-primary);
    line-height: var(--leading-sm);
  }

  .markdown-preview :global(h2) {
    font-size: var(--text-2xl);
    font-weight: var(--weight-bold);
    margin: var(--space-5) 0 var(--space-3);
    letter-spacing: var(--tracking-2xl);
    color: var(--color-text-primary);
    line-height: var(--leading-sm);
  }

  .markdown-preview :global(h3) {
    font-size: var(--text-xl);
    font-weight: var(--weight-semibold);
    margin: var(--space-4) 0 var(--space-2);
    color: var(--color-text-primary);
    line-height: var(--leading-sm);
  }

  .markdown-preview :global(h4),
  .markdown-preview :global(h5),
  .markdown-preview :global(h6) {
    font-size: var(--text-base);
    font-weight: var(--weight-semibold);
    margin: var(--space-3) 0 var(--space-2);
    color: var(--color-text-primary);
    line-height: var(--leading-sm);
  }

  .markdown-preview :global(p) {
    margin: 0 0 var(--space-4);
    color: var(--color-text-primary);
    line-height: var(--leading-base);
  }

  .markdown-preview :global(a) {
    color: var(--color-accent-secondary);
    text-decoration: underline;
    text-underline-offset: 2px;
    transition: color var(--transition-fast);
  }

  .markdown-preview :global(a:hover) {
    color: var(--color-accent-primary);
  }

  .markdown-preview :global(strong) {
    font-weight: var(--weight-bold);
    color: var(--color-text-primary);
  }

  .markdown-preview :global(em) {
    font-style: italic;
  }

  .markdown-preview :global(code) {
    font-family: var(--font-mono);
    font-size: 0.875em;
    background: var(--color-bg-tertiary);
    padding: 2px 6px;
    border-radius: var(--radius-sm);
    color: var(--color-accent-secondary);
    border: 1px solid var(--color-border-subtle);
  }

  .markdown-preview :global(pre) {
    background: var(--color-bg-tertiary);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-lg);
    padding: var(--space-4);
    margin: var(--space-4) 0;
    overflow-x: auto;
  }

  .markdown-preview :global(pre code) {
    background: none;
    padding: 0;
    border-radius: 0;
    border: none;
    color: inherit;
    font-size: var(--text-sm);
  }

  .markdown-preview :global(ul),
  .markdown-preview :global(ol) {
    margin: 0 0 var(--space-4) var(--space-6);
  }

  .markdown-preview :global(li) {
    margin-bottom: var(--space-1);
    color: var(--color-text-primary);
    line-height: var(--leading-base);
  }

  .markdown-preview :global(blockquote) {
    border-left: 3px solid var(--color-accent-primary);
    padding-left: var(--space-4);
    margin: var(--space-4) 0;
    color: var(--color-text-secondary);
    font-style: italic;
    background: var(--color-accent-primary-muted);
    border-radius: 0 var(--radius-md) var(--radius-md) 0;
    padding-top: var(--space-3);
    padding-bottom: var(--space-3);
    padding-right: var(--space-4);
  }

  .markdown-preview :global(hr) {
    border: none;
    border-top: 1px solid var(--color-border-default);
    margin: var(--space-6) 0;
  }

  .markdown-preview :global(table) {
    width: 100%;
    border-collapse: collapse;
    margin: var(--space-4) 0;
    border-radius: var(--radius-md);
    overflow: hidden;
  }

  .markdown-preview :global(th) {
    background: var(--color-bg-elevated);
    padding: var(--space-2) var(--space-3);
    text-align: left;
    font-weight: var(--weight-semibold);
    border: 1px solid var(--color-border-default);
    color: var(--color-text-primary);
    font-size: var(--text-sm);
  }

  .markdown-preview :global(td) {
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--color-border-subtle);
    color: var(--color-text-primary);
    font-size: var(--text-sm);
  }

  .markdown-preview :global(tr:nth-child(even) td) {
    background: var(--color-bg-secondary);
  }

  .markdown-preview :global(img) {
    max-width: 100%;
    border-radius: var(--radius-md);
  }
</style>
