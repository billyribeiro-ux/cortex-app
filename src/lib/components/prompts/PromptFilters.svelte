<script lang="ts">
  import { promptsStore } from '$lib/stores/prompts.svelte.js';
  import Icon from '@iconify/svelte';

  const sortLabels: Record<string, string> = {
    updatedAt: 'Updated',
    createdAt: 'Created',
    title: 'Title',
  };
</script>

<div class="filters-bar">
  <div class="search-wrap">
    <span class="search-icon">
      <Icon icon="ph:magnifying-glass" width={14} height={14} />
    </span>
    <input
      id="prompt-search"
      name="prompt-search"
      class="search-input selectable"
      type="text"
      placeholder="Search prompts..."
      value={promptsStore.filter.searchQuery}
      oninput={(e) => promptsStore.setSearchQuery((e.currentTarget as HTMLInputElement).value)}
    />
    {#if promptsStore.filter.searchQuery}
      <button class="clear-btn" onclick={() => promptsStore.setSearchQuery('')} aria-label="Clear search">
        <Icon icon="ph:x" width={12} height={12} />
      </button>
    {/if}
  </div>

  {#if promptsStore.allTags.length > 0}
    <div class="tag-filters">
      {#each promptsStore.allTags as tag}
        <button
          class="tag-pill"
          class:active={promptsStore.filter.tags.includes(tag)}
          onclick={() => promptsStore.toggleTagFilter(tag)}
          title={promptsStore.filter.tags.includes(tag) ? `Remove filter: ${tag}` : `Filter by: ${tag}`}
        >
          {tag}
        </button>
      {/each}
      {#if promptsStore.filter.tags.length > 0}
        <button
          class="tag-pill clear-tags"
          onclick={() => promptsStore.clearTagFilters()}
          title="Clear tag filters"
        >
          Clear tags
        </button>
      {/if}
    </div>
  {/if}

  <button
    class="fav-toggle"
    class:active={promptsStore.filter.favoritesOnly}
    onclick={() => promptsStore.setFavoritesOnly(!promptsStore.filter.favoritesOnly)}
    aria-label="Show favorites only"
    title="Favorites only"
  >
    <Icon icon={promptsStore.filter.favoritesOnly ? 'ph:star-fill' : 'ph:star'} width={16} height={16} />
  </button>

  <div class="sort-group">
    <select
      class="sort-select"
      value={promptsStore.filter.sortField}
      onchange={(e) => promptsStore.setSortField((e.currentTarget as HTMLSelectElement).value as 'updatedAt' | 'createdAt' | 'title')}
    >
      {#each Object.entries(sortLabels) as [value, label]}
        <option {value}>{label}</option>
      {/each}
    </select>
    <button
      class="sort-dir-btn"
      onclick={() => promptsStore.toggleSortDirection()}
      aria-label="Toggle sort direction"
      title={promptsStore.filter.sortDirection === 'desc' ? 'Descending' : 'Ascending'}
    >
      <Icon
        icon={promptsStore.filter.sortDirection === 'desc' ? 'ph:arrow-down' : 'ph:arrow-up'}
        width={14}
        height={14}
      />
    </button>
  </div>
</div>

<style>
  .filters-bar {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    background: var(--color-bg-secondary);
    border-bottom: 1px solid var(--color-border-subtle);
    flex-shrink: 0;
    flex-wrap: wrap;
  }

  .search-wrap {
    position: relative;
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 140px;
    max-width: 260px;
  }

  .search-icon {
    position: absolute;
    left: var(--space-2);
    color: var(--color-text-quaternary);
    display: flex;
    align-items: center;
    pointer-events: none;
  }

  .search-input {
    width: 100%;
    padding: var(--space-1-5) var(--space-3) var(--space-1-5) var(--space-7);
    font-size: var(--text-xs);
    color: var(--color-text-primary);
    background: var(--color-bg-tertiary);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-md);
    outline: none;
    transition:
      border-color var(--transition-fast),
      box-shadow var(--transition-fast);
    letter-spacing: var(--tracking-xs);
  }

  .search-input:focus {
    border-color: var(--color-accent-primary);
  }

  .search-input::placeholder {
    color: var(--color-text-quaternary);
  }

  .clear-btn {
    position: absolute;
    right: var(--space-1-5);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border: none;
    background: none;
    border-radius: var(--radius-sm);
    color: var(--color-text-quaternary);
    cursor: pointer;
    transition: color var(--transition-fast), background var(--transition-fast);
  }

  .clear-btn:hover {
    color: var(--color-text-secondary);
    background: var(--color-bg-hover);
  }

  .tag-filters {
    display: flex;
    gap: var(--space-1);
    flex-wrap: wrap;
  }

  .tag-pill {
    padding: var(--space-0-5) var(--space-2);
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    color: var(--color-text-tertiary);
    background: var(--color-bg-tertiary);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-full);
    cursor: pointer;
    transition:
      background var(--transition-fast),
      color var(--transition-fast),
      border-color var(--transition-fast);
    letter-spacing: var(--tracking-xs);
  }

  .tag-pill:hover {
    background: var(--color-bg-hover);
    color: var(--color-text-primary);
  }

  .tag-pill.active {
    background: var(--color-accent-primary-muted);
    color: var(--color-accent-primary);
    border-color: var(--color-accent-primary);
  }

  .tag-pill.clear-tags {
    color: var(--color-text-quaternary);
    font-style: italic;
  }

  .fav-toggle {
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
      color var(--transition-fast);
  }

  .fav-toggle:hover {
    background: var(--color-bg-hover);
    color: var(--color-accent-warning);
  }

  .fav-toggle.active {
    color: var(--color-accent-warning);
    background: var(--color-bg-hover);
  }

  .sort-group {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    margin-left: auto;
  }

  .sort-select {
    font-size: var(--text-xs);
    color: var(--color-text-secondary);
    background: var(--color-bg-tertiary);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-md);
    padding: var(--space-1) var(--space-2);
    outline: none;
    cursor: pointer;
    letter-spacing: var(--tracking-xs);
  }

  .sort-dir-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: none;
    background: none;
    border-radius: var(--radius-md);
    color: var(--color-text-tertiary);
    cursor: pointer;
    transition:
      background var(--transition-fast),
      color var(--transition-fast);
  }

  .sort-dir-btn:hover {
    background: var(--color-bg-hover);
    color: var(--color-text-primary);
  }
</style>
