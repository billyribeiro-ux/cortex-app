<script lang="ts">
  import { notesStore } from '$lib/stores/notes.svelte.js';
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
      class="search-input selectable"
      type="text"
      placeholder="Search notes..."
      value={notesStore.filter.searchQuery}
      oninput={(e) => notesStore.setSearchQuery((e.currentTarget as HTMLInputElement).value)}
    />
    {#if notesStore.filter.searchQuery}
      <button class="clear-btn" onclick={() => notesStore.setSearchQuery('')} aria-label="Clear search">
        <Icon icon="ph:x" width={12} height={12} />
      </button>
    {/if}
  </div>

  <!-- Tag filter pills: click to filter, selected tags show highlighted -->
  {#if notesStore.allTags.length > 0}
    <div class="tag-filters">
      {#each notesStore.allTags as tag}
        <button
          class="tag-pill"
          class:active={notesStore.filter.tags.includes(tag)}
          onclick={() => notesStore.toggleTagFilter(tag)}
          title={notesStore.filter.tags.includes(tag) ? `Remove filter: ${tag}` : `Filter by: ${tag}`}
        >
          {tag}
        </button>
      {/each}
      {#if notesStore.filter.tags.length > 0}
        <button
          class="tag-pill clear-tags"
          onclick={() => notesStore.clearTagFilters()}
          title="Clear tag filters"
        >
          Clear tags
        </button>
      {/if}
    </div>
  {/if}

  <div class="filter-group">
    <select
      class="category-select"
      value={notesStore.filter.category ?? ''}
      onchange={(e) => {
        const val = (e.currentTarget as HTMLSelectElement).value;
        notesStore.setCategoryFilter(val === '' ? null : val);
      }}
    >
      <option value="">All Categories</option>
      {#each notesStore.categories as cat}
        <option value={cat.id}>{cat.name}</option>
      {/each}
    </select>
  </div>

  <button
    class="fav-toggle"
    class:active={notesStore.filter.favoritesOnly}
    onclick={() => notesStore.setFavoritesOnly(!notesStore.filter.favoritesOnly)}
    aria-label="Show favorites only"
    title="Favorites only"
  >
    <Icon icon={notesStore.filter.favoritesOnly ? 'ph:star-fill' : 'ph:star'} width={16} height={16} />
  </button>

  <div class="sort-group">
    <select
      class="sort-select"
      value={notesStore.filter.sortField}
      onchange={(e) => notesStore.setSortField((e.currentTarget as HTMLSelectElement).value as 'updatedAt' | 'createdAt' | 'title')}
    >
      {#each Object.entries(sortLabels) as [value, label]}
        <option {value}>{label}</option>
      {/each}
    </select>
    <button
      class="sort-dir-btn"
      onclick={() => notesStore.toggleSortDirection()}
      aria-label="Toggle sort direction"
      title={notesStore.filter.sortDirection === 'desc' ? 'Descending' : 'Ascending'}
    >
      <Icon
        icon={notesStore.filter.sortDirection === 'desc' ? 'ph:arrow-down' : 'ph:arrow-up'}
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
    gap: var(--space-2);
    padding: var(--space-3) var(--space-4);
    background: var(--color-bg-secondary);
    border-bottom: 1px solid var(--color-border-subtle);
    flex-shrink: 0;
  }

  .search-wrap {
    position: relative;
    display: flex;
    align-items: center;
    flex: 1;
    max-width: 280px;
  }

  .search-icon {
    position: absolute;
    left: 10px;
    color: var(--color-text-quaternary);
    display: flex;
    align-items: center;
    pointer-events: none;
    transition: color var(--transition-normal);
  }

  .search-wrap:focus-within .search-icon {
    color: var(--color-accent-primary);
  }

  .search-input {
    width: 100%;
    height: 36px;
    padding: 0 var(--space-7) 0 30px;
    background: var(--color-bg-tertiary);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-md);
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    color: var(--color-text-primary);
    letter-spacing: var(--tracking-sm);
    transition:
      border-color var(--transition-normal),
      box-shadow var(--transition-normal),
      background var(--transition-normal);
  }

  .search-input::placeholder {
    color: var(--color-text-quaternary);
    font-weight: var(--weight-medium);
  }

  .search-input:hover {
    border-color: var(--color-border-default);
  }

  .search-input:focus {
    outline: none;
    border-color: var(--color-accent-primary);
    box-shadow: var(--shadow-glow);
    background: var(--color-bg-elevated);
  }

  .clear-btn {
    position: absolute;
    right: var(--space-2);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: var(--radius-xs);
    color: var(--color-text-quaternary);
    transition:
      color var(--transition-fast),
      background var(--transition-fast),
      transform var(--transition-fast);
  }

  .clear-btn:hover {
    color: var(--color-text-secondary);
    background: var(--color-bg-hover);
  }

  .clear-btn:active {
    transform: scale(0.9);
  }

  .tag-filters {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    flex-wrap: wrap;
  }

  .tag-pill {
    padding: var(--space-0-5) var(--space-3);
    border-radius: var(--radius-full);
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    border: 1px solid var(--color-border-subtle);
    background: var(--color-bg-tertiary);
    color: var(--color-text-secondary);
    cursor: pointer;
    letter-spacing: var(--tracking-xs);
    transition:
      background var(--transition-fast),
      border-color var(--transition-fast),
      color var(--transition-fast),
      transform 120ms var(--ease-spring);
    white-space: nowrap;
  }

  .tag-pill:hover {
    border-color: var(--color-accent-primary);
    color: var(--color-accent-primary);
  }

  .tag-pill:active {
    transform: scale(0.96);
  }

  .tag-pill.active {
    border-color: var(--color-accent-primary);
    background: var(--color-accent-primary-muted);
    color: var(--color-accent-primary);
  }

  .tag-pill.clear-tags {
    color: var(--color-accent-danger);
    border-color: var(--color-border-subtle);
  }

  .tag-pill.clear-tags:hover {
    border-color: var(--color-accent-danger);
    background: var(--color-accent-danger-muted);
  }

  .filter-group {
    display: flex;
    align-items: center;
  }

  .category-select,
  .sort-select {
    height: 32px;
    padding: 0 var(--space-3);
    background: var(--color-bg-tertiary);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-md);
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    color: var(--color-text-secondary);
    cursor: pointer;
    letter-spacing: var(--tracking-xs);
    transition:
      border-color var(--transition-fast),
      box-shadow var(--transition-fast);
  }

  .category-select:focus,
  .sort-select:focus {
    outline: none;
    border-color: var(--color-accent-primary);
    box-shadow: var(--shadow-glow);
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
      color var(--transition-fast),
      transform 120ms var(--ease-spring);
  }

  .fav-toggle:hover {
    background: var(--color-bg-hover);
    color: var(--color-accent-warning);
  }

  .fav-toggle:active {
    transform: scale(0.90);
  }

  .fav-toggle.active {
    color: var(--color-accent-warning);
    background: var(--color-accent-primary-muted);
  }

  .sort-group {
    display: flex;
    align-items: center;
    gap: var(--space-1);
  }

  .sort-dir-btn {
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

  .sort-dir-btn:hover {
    background: var(--color-bg-hover);
    color: var(--color-text-primary);
  }

  .sort-dir-btn:active {
    transform: scale(0.90);
  }
</style>
