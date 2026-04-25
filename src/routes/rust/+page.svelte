<script lang="ts">
  import { appStore } from '$lib/stores/app.svelte.js';
  import { rustStore } from '$lib/stores/rust.svelte.js';
  import RustListItem from '$lib/components/rust/RustListItem.svelte';
  import RustFilters from '$lib/components/rust/RustFilters.svelte';
  import RustEditor from '$lib/components/rust/RustEditor.svelte';
  import Icon from '@iconify/svelte';
  import { fly } from 'svelte/transition';

  let editorRef = $state<{ handleForceSave: () => void } | null>(null);

  $effect(() => {
    rustStore.setSearchQuery(appStore.searchQuery);
  });

  function handleNew(): void {
    rustStore.createRust();
  }

  function handleKeydown(e: KeyboardEvent): void {
    const isMod = e.metaKey || e.ctrlKey;

    if (isMod && e.key === 'n') {
      e.preventDefault();
      handleNew();
    } else if (isMod && e.key === 'f') {
      e.preventDefault();
      const searchEl = document.querySelector<HTMLInputElement>('.filters-bar .search-input');
      searchEl?.focus();
    } else if (isMod && e.key === 's') {
      e.preventDefault();
      editorRef?.handleForceSave();
    } else if (e.key === 'Escape') {
      rustStore.setActiveRust(null);
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="rust-page">
  <RustFilters />

  <div class="rust-body">
    <aside class="list-panel">
      <div class="list-header">
        <button class="new-btn" onclick={handleNew}>
          <Icon icon="ph:plus" width={16} height={16} />
          New Rust
        </button>
      </div>

      <div class="list-scroll">
        {#if appStore.rust.length === 0}
          <div class="empty-state" in:fly={{ y: 20, duration: 400, delay: 100 }}>
            <div class="empty-icon-wrap">
              <Icon icon="simple-icons:rust" width={32} height={32} />
            </div>
            <div class="empty-text">
              <h3>No items yet</h3>
              <p class="empty-sub">Create your first entry!</p>
            </div>
          </div>
        {:else if rustStore.filteredRust.length === 0}
          <div class="empty-state" in:fly={{ y: 20, duration: 400 }}>
            <div class="empty-icon-wrap">
              <Icon icon="ph:funnel" width={32} height={32} />
            </div>
            <div class="empty-text">
              <h3>No items found</h3>
              <p class="empty-sub">Try adjusting your filters.</p>
            </div>
            <button class="clear-filters-btn" onclick={() => rustStore.clearFilters()}>
              Clear filters
            </button>
          </div>
        {:else}
          {#each rustStore.filteredRust as item (item.id)}
            <RustListItem
              {item}
              isActive={rustStore.activeRustId === item.id}
              onclick={() => rustStore.setActiveRust(item.id)}
              onToggleFavorite={() => rustStore.toggleFavorite(item.id)}
            />
          {/each}
        {/if}
      </div>
    </aside>

    <div class="editor-panel">
      {#if rustStore.activeRust}
        <RustEditor bind:this={editorRef} item={rustStore.activeRust} />
      {:else}
        <div class="no-item-state" in:fly={{ y: 20, duration: 400, delay: 150 }}>
          <div class="empty-icon-wrap-large">
            <Icon icon="simple-icons:rust" width={48} height={48} />
          </div>
          <div class="empty-text">
            <h3>Select an item</h3>
            <p class="empty-sub">Or create a new one</p>
          </div>
          <button class="new-btn-center" onclick={handleNew}>
            <Icon icon="ph:plus" width={16} height={16} />
            New Rust
          </button>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .rust-page {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
    margin: calc(-1 * var(--space-8));
  }

  .rust-body {
    display: flex;
    flex: 1;
    overflow: hidden;
    min-height: 0;
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

  .no-item-state .empty-text h3 {
    font-size: var(--text-lg);
  }

  .no-item-state .empty-sub {
    font-size: var(--text-sm);
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
