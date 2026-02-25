<script lang="ts">
  import type { GoalStatus } from '$lib/types/index.js';
  import { GOAL_STATUS_CONFIG } from '$lib/types/index.js';
  import { goalsStore } from '$lib/stores/goals.svelte.js';
  import { notesStore } from '$lib/stores/notes.svelte.js';
  import Icon from '@iconify/svelte';

  const statuses = Object.keys(GOAL_STATUS_CONFIG) as GoalStatus[];

  const sortLabels: Record<string, string> = {
    updatedAt: 'Updated',
    createdAt: 'Created',
    title: 'Title',
    targetDate: 'Target Date',
    progress: 'Progress',
  };
</script>

<div class="filters-bar">
  <!-- Search -->
  <div class="search-wrap">
    <span class="search-icon"><Icon icon="ph:magnifying-glass" width={14} height={14} /></span>
    <input
      class="search-input selectable"
      type="text"
      placeholder="Search goals..."
      value={goalsStore.filter.searchQuery}
      oninput={(e) => goalsStore.setSearchQuery((e.currentTarget as HTMLInputElement).value)}
    />
    {#if goalsStore.filter.searchQuery}
      <button class="clear-btn" onclick={() => goalsStore.setSearchQuery('')} aria-label="Clear">
        <Icon icon="ph:x" width={12} height={12} />
      </button>
    {/if}
  </div>

  <!-- Status filter -->
  <div class="status-filters">
    <button
      class="filter-pill"
      class:active={goalsStore.filter.status === null}
      onclick={() => goalsStore.setStatusFilter(null)}
    >All</button>
    {#each statuses as s}
      {@const cfg = GOAL_STATUS_CONFIG[s]}
      <button
        class="filter-pill"
        class:active={goalsStore.filter.status === s}
        style:--pill-color={cfg.color}
        onclick={() => goalsStore.setStatusFilter(goalsStore.filter.status === s ? null : s)}
        title={cfg.label}
      >
        <Icon icon={cfg.icon} width={12} height={12} />
        <span class="pill-label">{cfg.label}</span>
      </button>
    {/each}
  </div>

  <!-- Category filter -->
  <select
    class="mini-select"
    value={goalsStore.filter.category ?? ''}
    onchange={(e) => {
      const v = (e.currentTarget as HTMLSelectElement).value;
      goalsStore.setCategoryFilter(v === '' ? null : v);
    }}
  >
    <option value="">All Categories</option>
    {#each notesStore.categories as cat}
      <option value={cat.id}>{cat.name}</option>
    {/each}
  </select>

  <!-- Sort -->
  <div class="sort-group">
    <select
      class="mini-select"
      value={goalsStore.filter.sortField}
      onchange={(e) => goalsStore.setSortField((e.currentTarget as HTMLSelectElement).value as 'updatedAt' | 'createdAt' | 'title' | 'targetDate' | 'progress')}
    >
      {#each Object.entries(sortLabels) as [value, label]}
        <option {value}>{label}</option>
      {/each}
    </select>
    <button class="sort-dir-btn" onclick={() => goalsStore.toggleSortDirection()} title="Toggle sort direction">
      <Icon icon={goalsStore.filter.sortDirection === 'asc' ? 'ph:arrow-up' : 'ph:arrow-down'} width={14} height={14} />
    </button>
  </div>

  <div class="spacer"></div>

  <!-- New Goal button -->
  <button class="new-goal-btn" onclick={() => goalsStore.openCreateModal()}>
    <Icon icon="ph:plus" width={14} height={14} />
    New Goal
  </button>
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
    flex-wrap: wrap;
  }

  .search-wrap {
    position: relative;
    display: flex;
    align-items: center;
    width: 200px;
    flex-shrink: 0;
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

  .search-input:hover {
    border-color: var(--color-border-default);
  }

  .search-input:focus {
    outline: none;
    border-color: var(--color-accent-primary);
    box-shadow: var(--shadow-glow);
    background: var(--color-bg-elevated);
  }

  .search-input::placeholder {
    color: var(--color-text-quaternary);
    font-weight: var(--weight-medium);
  }

  .clear-btn {
    position: absolute;
    right: var(--space-2);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    color: var(--color-text-quaternary);
    border-radius: var(--radius-xs);
    transition: color var(--transition-fast), background var(--transition-fast), transform var(--transition-fast);
  }

  .clear-btn:hover {
    color: var(--color-text-secondary);
    background: var(--color-bg-hover);
  }

  .clear-btn:active {
    transform: scale(0.9);
  }

  .status-filters {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    flex-wrap: wrap;
  }

  .filter-pill {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px var(--space-2);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-sm);
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    color: var(--color-text-tertiary);
    transition:
      border-color var(--transition-fast),
      background var(--transition-fast),
      color var(--transition-fast);
    white-space: nowrap;
  }

  .filter-pill:hover {
    border-color: var(--pill-color, var(--color-accent-primary));
    color: var(--pill-color, var(--color-accent-primary));
    background: color-mix(in srgb, var(--pill-color, var(--color-accent-primary)) 6%, transparent);
  }

  .filter-pill:active {
    background: color-mix(in srgb, var(--pill-color, var(--color-accent-primary)) 20%, transparent);
    transition: background 0.05s;
  }

  .filter-pill.active {
    border-color: var(--pill-color, var(--color-accent-primary));
    background: var(--color-accent-primary-muted);
    color: var(--pill-color, var(--color-accent-primary));
  }

  .pill-label { display: none; }

  @media (min-width: 1200px) {
    .pill-label { display: inline; }
  }

  .mini-select {
    height: 32px;
    padding: 0 var(--space-2);
    background: var(--color-bg-tertiary);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-md);
    font-size: var(--text-xs);
    color: var(--color-text-secondary);
    cursor: pointer;
    transition:
      border-color var(--transition-fast),
      box-shadow var(--transition-fast);
  }

  .mini-select:focus {
    outline: none;
    border-color: var(--color-accent-primary);
    box-shadow: var(--shadow-glow);
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
    border-radius: var(--radius-md);
    color: var(--color-text-tertiary);
    transition:
      background var(--transition-fast),
      color var(--transition-fast);
  }

  .sort-dir-btn:hover {
    background: var(--color-bg-hover);
    color: var(--color-text-primary);
  }

  .sort-dir-btn:active {
    background: var(--color-bg-active);
    transition: background 0.05s;
  }

  .spacer { flex: 1; }

  .new-goal-btn {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-4);
    background: var(--color-accent-primary);
    color: #fff;
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    font-weight: var(--weight-semibold);
    white-space: nowrap;
    min-height: 36px;
    transition:
      background var(--transition-fast),
      transform var(--transition-fast);
    flex-shrink: 0;
  }

  .new-goal-btn:hover {
    background: var(--color-accent-primary-hover);
  }

  .new-goal-btn:active {
    transform: scale(0.97);
    transition: transform 0.1s var(--ease-out);
  }
</style>
