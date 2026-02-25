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
    transition:
      background 180ms var(--ease-out),
      border-color 180ms var(--ease-out),
      box-shadow 180ms var(--ease-out);
    border-left: 3px solid transparent;
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    position: relative;
  }

  .note-item:hover {
    background: var(--color-bg-hover);
  }

  .note-item.active {
    background: var(--color-accent-primary-muted);
    border-left-color: var(--color-accent-primary);
    box-shadow: var(--shadow-xs);
  }

  .note-item-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
  }

  .note-title {
    font-size: var(--text-sm);
    font-weight: var(--weight-semibold);
    line-height: var(--leading-sm);
    color: var(--color-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
    letter-spacing: var(--tracking-sm);
  }

  .fav-btn {
    color: var(--color-text-tertiary);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: none;
    background: none;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition:
      color 150ms var(--ease-out),
      background 150ms var(--ease-out),
      opacity 150ms var(--ease-out),
      transform 120ms var(--ease-spring);
    flex-shrink: 0;
    opacity: 0;
  }

  .note-item:hover .fav-btn,
  .fav-btn.favorited {
    opacity: 1;
  }

  .fav-btn:hover {
    background: var(--color-bg-hover);
    color: var(--color-accent-warning);
  }

  .fav-btn:active {
    transform: scale(0.88);
  }

  .fav-btn.favorited {
    color: var(--color-accent-warning);
  }

  .note-meta {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    font-size: var(--text-xs);
    letter-spacing: var(--tracking-xs);
    color: var(--color-text-tertiary);
    line-height: var(--leading-sm);
  }

  .category-dot {
    width: 7px;
    height: 7px;
    border-radius: var(--radius-full);
    flex-shrink: 0;
  }

  .category-name {
    color: var(--color-text-tertiary);
    font-weight: var(--weight-medium);
  }

  .sep {
    color: var(--color-text-quaternary);
    user-select: none;
  }

  .rel-time {
    color: var(--color-text-quaternary);
  }

  .note-preview {
    font-size: var(--text-xs);
    color: var(--color-text-quaternary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: var(--leading-base);
    margin-top: var(--space-0-5);
  }
</style>
