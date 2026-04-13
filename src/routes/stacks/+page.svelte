<script lang="ts">
  import { appStore } from '$lib/stores/app.svelte.js';
  import { stacksStore } from '$lib/stores/stacks.svelte.js';
  import StackListItem from '$lib/components/stacks/StackListItem.svelte';
  import StackFilters from '$lib/components/stacks/StackFilters.svelte';
  import StackEditor from '$lib/components/stacks/StackEditor.svelte';
  import Icon from '@iconify/svelte';

  let editorRef = $state<{ handleForceSave: () => void } | null>(null);

  $effect(() => {
    stacksStore.setSearchQuery(appStore.searchQuery);
  });

  function handleNewStack(): void {
    stacksStore.createStack();
  }

  function handleKeydown(e: KeyboardEvent): void {
    const isMod = e.metaKey || e.ctrlKey;

    if (isMod && e.key === 'n') {
      e.preventDefault();
      handleNewStack();
    } else if (isMod && e.key === 'f') {
      e.preventDefault();
      const searchEl = document.querySelector<HTMLInputElement>('.filters-bar .search-input');
      searchEl?.focus();
    } else if (isMod && e.key === 's') {
      e.preventDefault();
      editorRef?.handleForceSave();
    } else if (e.key === 'Escape') {
      stacksStore.setActiveStack(null);
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="stacks-page">
  <StackFilters />

  <div class="stacks-body">
    <!-- Left: Stack List -->
    <aside class="list-panel">
      <div class="list-header">
        <button class="new-btn" onclick={handleNewStack}>
          <Icon icon="ph:plus" width={16} height={16} />
          New Stack
        </button>
      </div>

      <div class="list-scroll">
        {#if appStore.stacks.length === 0}
          <div class="empty-state">
            <Icon icon="ph:stack" width={40} height={40} />
            <p>No stacks yet.</p>
            <p class="empty-sub">Create your first stack!</p>
          </div>
        {:else if stacksStore.filteredStacks.length === 0}
          <div class="empty-state">
            <Icon icon="ph:funnel" width={40} height={40} />
            <p>No stacks match your filters.</p>
            <button class="clear-filters-btn" onclick={() => stacksStore.clearFilters()}>
              Clear filters
            </button>
          </div>
        {:else}
          {#each stacksStore.filteredStacks as stack (stack.id)}
            <StackListItem
              {stack}
              isActive={stacksStore.activeStackId === stack.id}
              onclick={() => stacksStore.setActiveStack(stack.id)}
              onToggleFavorite={() => stacksStore.toggleFavorite(stack.id)}
            />
          {/each}
        {/if}
      </div>
    </aside>

    <!-- Center: Stack Editor -->
    <div class="editor-panel">
      {#if stacksStore.activeStack}
        <StackEditor bind:this={editorRef} stack={stacksStore.activeStack} />
      {:else}
        <div class="no-item-state">
          <Icon icon="ph:stack" width={48} height={48} />
          <p>Select a stack or create a new one</p>
          <button class="new-btn-center" onclick={handleNewStack}>
            <Icon icon="ph:plus" width={16} height={16} />
            New Stack
          </button>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .stacks-page {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    margin: calc(-1 * var(--space-8));
  }

  .stacks-body {
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
