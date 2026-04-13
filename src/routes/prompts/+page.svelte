<script lang="ts">
  import { appStore } from '$lib/stores/app.svelte.js';
  import { promptsStore } from '$lib/stores/prompts.svelte.js';
  import PromptListItem from '$lib/components/prompts/PromptListItem.svelte';
  import PromptFilters from '$lib/components/prompts/PromptFilters.svelte';
  import PromptEditor from '$lib/components/prompts/PromptEditor.svelte';
  import Icon from '@iconify/svelte';

  let editorRef = $state<{ handleForceSave: () => void } | null>(null);

  $effect(() => {
    promptsStore.setSearchQuery(appStore.searchQuery);
  });

  function handleNewPrompt(): void {
    promptsStore.createPrompt();
  }

  function handleKeydown(e: KeyboardEvent): void {
    const isMod = e.metaKey || e.ctrlKey;

    if (isMod && e.key === 'n') {
      e.preventDefault();
      handleNewPrompt();
    } else if (isMod && e.key === 'f') {
      e.preventDefault();
      const searchEl = document.querySelector<HTMLInputElement>('.filters-bar .search-input');
      searchEl?.focus();
    } else if (isMod && e.key === 's') {
      e.preventDefault();
      editorRef?.handleForceSave();
    } else if (e.key === 'Escape') {
      promptsStore.setActivePrompt(null);
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="prompts-page">
  <PromptFilters />

  <div class="prompts-body">
    <!-- Left: Prompt List -->
    <aside class="list-panel">
      <div class="list-header">
        <button class="new-btn" onclick={handleNewPrompt}>
          <Icon icon="ph:plus" width={16} height={16} />
          New Prompt
        </button>
      </div>

      <div class="list-scroll">
        {#if appStore.prompts.length === 0}
          <div class="empty-state">
            <Icon icon="ph:chat-text" width={40} height={40} />
            <p>No prompts yet.</p>
            <p class="empty-sub">Create your first prompt!</p>
          </div>
        {:else if promptsStore.filteredPrompts.length === 0}
          <div class="empty-state">
            <Icon icon="ph:funnel" width={40} height={40} />
            <p>No prompts match your filters.</p>
            <button class="clear-filters-btn" onclick={() => promptsStore.clearFilters()}>
              Clear filters
            </button>
          </div>
        {:else}
          {#each promptsStore.filteredPrompts as prompt (prompt.id)}
            <PromptListItem
              {prompt}
              isActive={promptsStore.activePromptId === prompt.id}
              onclick={() => promptsStore.setActivePrompt(prompt.id)}
              onToggleFavorite={() => promptsStore.toggleFavorite(prompt.id)}
            />
          {/each}
        {/if}
      </div>
    </aside>

    <!-- Center: Prompt Editor -->
    <div class="editor-panel">
      {#if promptsStore.activePrompt}
        <PromptEditor bind:this={editorRef} prompt={promptsStore.activePrompt} />
      {:else}
        <div class="no-item-state">
          <Icon icon="ph:chat-text" width={48} height={48} />
          <p>Select a prompt or create a new one</p>
          <button class="new-btn-center" onclick={handleNewPrompt}>
            <Icon icon="ph:plus" width={16} height={16} />
            New Prompt
          </button>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .prompts-page {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    margin: calc(-1 * var(--space-8));
  }

  .prompts-body {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  .list-panel {
    width: 280px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    background: var(--color-bg-secondary);
    border-right: 1px solid var(--color-border-subtle);
    overflow: hidden;
  }

  .list-header {
    padding: var(--space-3) var(--space-4);
    border-bottom: 1px solid var(--color-border-subtle);
    flex-shrink: 0;
  }

  .new-btn {
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

  .new-btn:hover {
    background: var(--color-accent-primary-hover);
    box-shadow: var(--shadow-sm);
  }

  .new-btn:active {
    transform: scale(0.97);
    box-shadow: var(--shadow-xs);
  }

  .list-scroll {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-1-5);
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-3);
    padding: var(--space-8) var(--space-4);
    text-align: center;
    color: var(--color-text-quaternary);
    height: 100%;
  }

  .empty-state p {
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
    color: var(--color-text-secondary);
    line-height: var(--leading-sm);
    margin: 0;
  }

  .empty-sub {
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    color: var(--color-text-tertiary);
    letter-spacing: var(--tracking-xs);
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

  .editor-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-width: 0;
    border-left: 1px solid var(--color-border-subtle);
  }

  .no-item-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-4);
    height: 100%;
    color: var(--color-text-quaternary);
    text-align: center;
  }

  .no-item-state p {
    font-size: var(--text-base);
    font-weight: var(--weight-medium);
    color: var(--color-text-secondary);
    line-height: var(--leading-base);
    margin: 0;
    letter-spacing: var(--tracking-sm);
  }

  .new-btn-center {
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

  .new-btn-center:hover {
    background: var(--color-accent-primary-hover);
    box-shadow: var(--shadow-sm);
  }

  .new-btn-center:active {
    transform: scale(0.97);
    box-shadow: var(--shadow-xs);
  }

  @media (max-width: 900px) {
    .list-panel {
      width: 220px;
    }
  }

  @media (max-width: 640px) {
    .list-panel {
      width: 180px;
      min-width: 160px;
    }
  }
</style>
