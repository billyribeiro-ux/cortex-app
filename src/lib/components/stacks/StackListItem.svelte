<script lang="ts">
  import type { Stack } from '$lib/types/index.js';
  import { getRelativeTime, stripMarkdown } from '$lib/utils/time.js';
  import Icon from '@iconify/svelte';

  interface Props {
    stack: Stack;
    isActive: boolean;
    onclick: () => void;
    onToggleFavorite: () => void;
  }

  let { stack, isActive, onclick, onToggleFavorite }: Props = $props();

  const preview = $derived(stripMarkdown(stack.content).slice(0, 80));
  const relTime = $derived(getRelativeTime(stack.updatedAt));

  function handleFavoriteClick(e: MouseEvent): void {
    e.stopPropagation();
    onToggleFavorite();
  }
</script>

<div
  class="stack-item"
  class:active={isActive}
  role="button"
  tabindex="0"
  {onclick}
  onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onclick(); } }}
>
  <div class="stack-item-header">
    <span class="stack-title">{stack.title || 'Untitled Stack'}</span>
    <button
      class="fav-btn"
      class:favorited={stack.isFavorite}
      onclick={handleFavoriteClick}
      aria-label={stack.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Icon icon={stack.isFavorite ? 'ph:star-fill' : 'ph:star'} width={14} height={14} />
    </button>
  </div>

  <div class="stack-meta">
    <span class="rel-time">{relTime}</span>
  </div>

  {#if preview}
    <p class="stack-preview">{preview}</p>
  {/if}
</div>

<style>
  .stack-item {
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

  .stack-item:hover {
    background: var(--color-bg-hover);
  }

  .stack-item.active {
    background: var(--color-accent-primary-muted);
    border-left-color: var(--color-accent-primary);
    box-shadow: var(--shadow-xs);
  }

  .stack-item-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
  }

  .stack-title {
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

  .stack-item:hover .fav-btn,
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

  .stack-meta {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    font-size: var(--text-xs);
    letter-spacing: var(--tracking-xs);
    color: var(--color-text-tertiary);
    line-height: var(--leading-sm);
  }

  .rel-time {
    color: var(--color-text-quaternary);
  }

  .stack-preview {
    font-size: var(--text-xs);
    color: var(--color-text-quaternary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: var(--leading-base);
    margin-top: var(--space-0-5);
  }
</style>
