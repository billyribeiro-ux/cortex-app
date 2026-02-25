<script lang="ts">
  import type { TaskStatus, TaskPriority } from '$lib/types/index.js';
  import { TASK_STATUS_CONFIG, TASK_PRIORITY_CONFIG } from '$lib/types/index.js';
  import { tasksStore } from '$lib/stores/tasks.svelte.js';
  import Icon from '@iconify/svelte';

  const statuses = Object.keys(TASK_STATUS_CONFIG) as TaskStatus[];
  const priorities = Object.keys(TASK_PRIORITY_CONFIG) as TaskPriority[];

  const sortLabels: Record<string, string> = {
    priority: 'Priority',
    dueDate: 'Due Date',
    createdAt: 'Created',
    updatedAt: 'Updated',
    title: 'Title',
  };
</script>

<div class="filters-bar">
  <!-- Search -->
  <div class="search-wrap">
    <span class="search-icon"><Icon icon="ph:magnifying-glass" width={14} height={14} /></span>
    <input
      class="search-input selectable"
      type="text"
      placeholder="Search tasks..."
      value={tasksStore.filter.searchQuery}
      oninput={(e) => tasksStore.setSearchQuery((e.currentTarget as HTMLInputElement).value)}
    />
    {#if tasksStore.filter.searchQuery}
      <button class="clear-btn" onclick={() => tasksStore.setSearchQuery('')} aria-label="Clear">
        <Icon icon="ph:x" width={12} height={12} />
      </button>
    {/if}
  </div>

  <!-- Status filter -->
  <div class="status-filters">
    <button
      class="filter-pill"
      class:active={tasksStore.filter.status === null}
      onclick={() => tasksStore.setStatusFilter(null)}
    >All</button>
    {#each statuses as s}
      {@const cfg = TASK_STATUS_CONFIG[s]}
      <button
        class="filter-pill"
        class:active={tasksStore.filter.status === s}
        style:--pill-color={cfg.color}
        onclick={() => tasksStore.setStatusFilter(tasksStore.filter.status === s ? null : s)}
        title={cfg.label}
      >
        <Icon icon={cfg.icon} width={12} height={12} />
        <span class="pill-label">{cfg.label}</span>
      </button>
    {/each}
  </div>

  <!-- Priority filter -->
  <select
    class="mini-select"
    value={tasksStore.filter.priority ?? ''}
    onchange={(e) => {
      const v = (e.currentTarget as HTMLSelectElement).value;
      tasksStore.setPriorityFilter(v === '' ? null : v as TaskPriority);
    }}
  >
    <option value="">All Priorities</option>
    {#each priorities as p}
      <option value={p}>{TASK_PRIORITY_CONFIG[p].label}</option>
    {/each}
  </select>

  <!-- Show completed toggle -->
  <label class="toggle-label">
    <input
      type="checkbox"
      checked={tasksStore.filter.showCompleted}
      onchange={(e) => tasksStore.setShowCompleted((e.currentTarget as HTMLInputElement).checked)}
    />
    Done
  </label>

  <!-- Sort -->
  <div class="sort-group">
    <select
      class="mini-select"
      value={tasksStore.filter.sortField}
      onchange={(e) => tasksStore.setSortField((e.currentTarget as HTMLSelectElement).value as 'priority' | 'dueDate' | 'createdAt' | 'updatedAt' | 'title')}
    >
      {#each Object.entries(sortLabels) as [value, label]}
        <option {value}>{label}</option>
      {/each}
    </select>
    <button class="sort-dir-btn" onclick={() => tasksStore.toggleSortDirection()} title="Toggle sort direction">
      <Icon icon={tasksStore.filter.sortDirection === 'asc' ? 'ph:arrow-up' : 'ph:arrow-down'} width={14} height={14} />
    </button>
  </div>

  <div class="spacer"></div>

  <!-- View mode toggle -->
  <div class="view-toggle">
    <button
      class="view-btn"
      class:active={tasksStore.viewMode === 'board'}
      onclick={() => { tasksStore.viewMode = 'board'; }}
      title="Board view"
    >
      <Icon icon="ph:columns" width={16} height={16} />
    </button>
    <button
      class="view-btn"
      class:active={tasksStore.viewMode === 'list'}
      onclick={() => { tasksStore.viewMode = 'list'; }}
      title="List view"
    >
      <Icon icon="ph:list" width={16} height={16} />
    </button>
  </div>

  <!-- New Task button -->
  <button class="new-task-btn" onclick={() => tasksStore.openCreateModal()}>
    <Icon icon="ph:plus" width={14} height={14} />
    New Task
  </button>
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
    transition: border-color var(--transition-normal), box-shadow var(--transition-normal), background var(--transition-normal);
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
    border-radius: var(--radius-xs);
    color: var(--color-text-quaternary);
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
  }

  .filter-pill {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    padding: var(--space-1) var(--space-2);
    min-height: 30px;
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-sm);
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    color: var(--color-text-tertiary);
    letter-spacing: var(--tracking-sm);
    transition: border-color var(--transition-fast), background var(--transition-fast), color var(--transition-fast), transform var(--transition-fast), box-shadow var(--transition-fast);
    white-space: nowrap;
  }

  .filter-pill:hover {
    border-color: var(--pill-color, var(--color-accent-primary));
    color: var(--pill-color, var(--color-accent-primary));
    background: color-mix(in srgb, var(--pill-color, var(--color-accent-primary)) 8%, transparent);
  }

  .filter-pill:active {
    transform: scale(0.97);
  }

  .filter-pill.active {
    border-color: color-mix(in srgb, var(--pill-color, var(--color-accent-primary)) 40%, transparent);
    background: color-mix(in srgb, var(--pill-color, var(--color-accent-primary)) 12%, transparent);
    color: var(--pill-color, var(--color-accent-primary));
    font-weight: var(--weight-semibold);
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--pill-color, var(--color-accent-primary)) 6%, transparent);
  }

  /* Hide labels on very narrow viewports; show icon + label from 768px up */
  .pill-label {
    display: none;
  }

  @media (min-width: 768px) {
    .pill-label {
      display: inline;
    }
  }

  .mini-select {
    height: 36px;
    padding: 0 var(--space-3);
    background: var(--color-bg-tertiary);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-md);
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    color: var(--color-text-secondary);
    cursor: pointer;
    letter-spacing: var(--tracking-sm);
    transition: border-color var(--transition-normal), box-shadow var(--transition-normal), background var(--transition-normal);
  }

  .mini-select:hover {
    border-color: var(--color-border-default);
  }

  .mini-select:focus {
    outline: none;
    border-color: var(--color-accent-primary);
    box-shadow: var(--shadow-glow);
    background: var(--color-bg-elevated);
  }

  .toggle-label {
    display: flex;
    align-items: center;
    gap: var(--space-1-5);
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    color: var(--color-text-secondary);
    cursor: pointer;
    white-space: nowrap;
    letter-spacing: var(--tracking-sm);
    transition: color var(--transition-fast);
  }

  .toggle-label:hover {
    color: var(--color-text-primary);
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
    width: 36px;
    height: 36px;
    border-radius: var(--radius-md);
    color: var(--color-text-tertiary);
    transition: background var(--transition-fast), color var(--transition-fast), transform var(--transition-fast);
  }

  .sort-dir-btn:hover {
    background: var(--color-bg-hover);
    color: var(--color-text-primary);
  }

  .sort-dir-btn:active {
    background: var(--color-bg-active);
    transform: scale(0.95);
  }

  .spacer { flex: 1; }

  .view-toggle {
    display: flex;
    background: var(--color-bg-tertiary);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-md);
    padding: var(--space-0-5);
    gap: var(--space-0-5);
  }

  .view-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: var(--radius-sm);
    color: var(--color-text-quaternary);
    transition: background var(--transition-fast), color var(--transition-fast), box-shadow var(--transition-fast), transform var(--transition-fast);
  }

  .view-btn:hover {
    color: var(--color-text-secondary);
    background: color-mix(in srgb, var(--color-bg-elevated) 50%, transparent);
  }

  .view-btn:active {
    transform: scale(0.95);
  }

  .view-btn.active {
    background: var(--color-bg-elevated);
    color: var(--color-text-primary);
    box-shadow: var(--shadow-xs);
  }

  .new-task-btn {
    display: flex;
    align-items: center;
    gap: var(--space-1-5);
    padding: 0 var(--space-4);
    min-height: 36px;
    background: var(--color-accent-primary);
    color: #fff;
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    font-weight: var(--weight-semibold);
    letter-spacing: var(--tracking-sm);
    white-space: nowrap;
    transition: background var(--transition-fast), transform var(--transition-fast), box-shadow var(--transition-fast);
    flex-shrink: 0;
    box-shadow: var(--shadow-xs);
  }

  .new-task-btn:hover {
    background: var(--color-accent-primary-hover);
    box-shadow: var(--shadow-sm);
  }

  .new-task-btn:active {
    transform: scale(0.97);
    box-shadow: none;
  }
</style>
