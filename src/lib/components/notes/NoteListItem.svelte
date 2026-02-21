<script lang="ts">
  import type { Note } from '$lib/types/index.js';
  import { notesStore } from '$lib/stores/notes.svelte.js';
  import { getRelativeTime, stripMarkdown } from '$lib/utils/time.js';
  import Icon from '@iconify/svelte';

  interface Props {
    note: Note;
    isActive: boolean;
    onclick: () => void;
    onToggleFavorite: () => void;
  }

  let { note, isActive, onclick, onToggleFavorite }: Props = $props();

  const categoryColor = $derived(
    notesStore.categories.find((c) => c.id === note.category)?.color ?? '#6c5ce7'
  );

  const preview = $derived(stripMarkdown(note.content).slice(0, 80));
  const relTime = $derived(getRelativeTime(note.updatedAt));

  function handleFavoriteClick(e: MouseEvent): void {
    e.stopPropagation();
    onToggleFavorite();
  }
</script>

<div
  class="note-item"
  class:active={isActive}
  role="button"
  tabindex="0"
  {onclick}
  onkeydown={(e) => e.key === 'Enter' && onclick()}
>
  <div class="note-item-header">
    <span class="note-title">{note.title || 'Untitled Note'}</span>
    <button
      class="fav-btn"
      class:favorited={note.isFavorite}
      onclick={handleFavoriteClick}
      aria-label={note.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Icon icon={note.isFavorite ? 'ph:star-fill' : 'ph:star'} width={14} height={14} />
    </button>
  </div>

  <div class="note-meta">
    <span class="category-dot" style:background={categoryColor}></span>
    <span class="category-name">
      {notesStore.categories.find((c) => c.id === note.category)?.name ?? note.category}
    </span>
    <span class="sep">·</span>
    <span class="rel-time">{relTime}</span>
  </div>

  {#if preview}
    <p class="note-preview">{preview}</p>
  {/if}
</div>

<style>
  .note-item {
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: background var(--transition-fast);
    border-left: 2px solid transparent;
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .note-item:hover {
    background: var(--color-bg-hover);
  }

  .note-item.active {
    background: var(--color-bg-elevated);
    border-left-color: var(--color-accent-primary);
  }

  .note-item-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
  }

  .note-title {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--color-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
  }

  .fav-btn {
    color: var(--color-text-tertiary);
    display: flex;
    align-items: center;
    padding: 2px;
    border-radius: var(--radius-sm);
    transition: color var(--transition-fast);
    flex-shrink: 0;
  }

  .fav-btn:hover,
  .fav-btn.favorited {
    color: var(--color-accent-warning);
  }

  .note-meta {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    font-size: var(--text-xs);
    color: var(--color-text-tertiary);
  }

  .category-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .category-name {
    color: var(--color-text-tertiary);
  }

  .sep {
    color: var(--color-text-tertiary);
    opacity: 0.5;
  }

  .rel-time {
    color: var(--color-text-tertiary);
  }

  .note-preview {
    font-size: var(--text-xs);
    color: var(--color-text-tertiary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.4;
  }
</style>
