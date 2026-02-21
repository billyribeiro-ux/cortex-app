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
    padding: var(--space-2) var(--space-4);
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
    left: var(--space-2);
    color: var(--color-text-tertiary);
    display: flex;
    align-items: center;
    pointer-events: none;
  }

  .search-input {
    width: 100%;
    height: 30px;
    padding: 0 var(--space-6) 0 var(--space-6);
    background: var(--color-bg-tertiary);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-md);
    font-size: var(--text-xs);
    color: var(--color-text-primary);
    transition: border-color var(--transition-fast);
  }

  .search-input::placeholder {
    color: var(--color-text-tertiary);
  }

  .search-input:focus {
    outline: none;
    border-color: var(--color-accent-primary);
  }

  .clear-btn {
    position: absolute;
    right: var(--space-2);
    display: flex;
    align-items: center;
    color: var(--color-text-tertiary);
    transition: color var(--transition-fast);
  }

  .clear-btn:hover {
    color: var(--color-text-primary);
  }

  .filter-group {
    display: flex;
    align-items: center;
  }

  .category-select,
  .sort-select {
    height: 30px;
    padding: 0 var(--space-2);
    background: var(--color-bg-tertiary);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-md);
    font-size: var(--text-xs);
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: border-color var(--transition-fast);
  }

  .category-select:focus,
  .sort-select:focus {
    outline: none;
    border-color: var(--color-accent-primary);
  }

  .fav-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: var(--radius-md);
    color: var(--color-text-tertiary);
    transition: background var(--transition-fast), color var(--transition-fast);
  }

  .fav-toggle:hover {
    background: var(--color-bg-hover);
    color: var(--color-accent-warning);
  }

  .fav-toggle.active {
    color: var(--color-accent-warning);
    background: rgba(253, 203, 110, 0.1);
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
    width: 30px;
    height: 30px;
    border-radius: var(--radius-md);
    color: var(--color-text-tertiary);
    transition: background var(--transition-fast), color var(--transition-fast);
  }

  .sort-dir-btn:hover {
    background: var(--color-bg-hover);
    color: var(--color-text-primary);
  }
</style>
