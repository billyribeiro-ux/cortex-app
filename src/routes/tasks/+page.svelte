<script lang="ts">
  import { appStore } from '$lib/stores/app.svelte.js';
  import { tasksStore } from '$lib/stores/tasks.svelte.js';
  import TaskFilters from '$lib/components/tasks/TaskFilters.svelte';
  import TaskBoardView from '$lib/components/tasks/TaskBoardView.svelte';
  import TaskListView from '$lib/components/tasks/TaskListView.svelte';
  import TaskModal from '$lib/components/tasks/TaskModal.svelte';
  import Icon from '@iconify/svelte';

  // Sync TopBar search → tasks filter
  $effect(() => {
    if (appStore.searchQuery) {
      tasksStore.setSearchQuery(appStore.searchQuery);
    }
  });

  function handleKeydown(e: KeyboardEvent): void {
    const isMod = e.metaKey || e.ctrlKey;
    if (tasksStore.showCreateModal) return;

    if (isMod && e.key === 'n') {
      e.preventDefault();
      tasksStore.openCreateModal();
    } else if (isMod && e.key === 'f') {
      e.preventDefault();
      document.querySelector<HTMLInputElement>('.filters-bar .search-input')?.focus();
    } else if (isMod && e.key === '1') {
      e.preventDefault();
      tasksStore.viewMode = 'board';
    } else if (isMod && e.key === '2') {
      e.preventDefault();
      tasksStore.viewMode = 'list';
    } else if (e.key === 'Escape') {
      tasksStore.setActiveTask(null);
    }
  }

  const hasAnyTasks = $derived(appStore.tasks.length > 0);
  const hasFilteredTasks = $derived(tasksStore.filteredTasks.length > 0);
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="tasks-page">
  <TaskFilters />

  <div class="tasks-body">
    {#if !hasAnyTasks}
      <div class="empty-state">
        <Icon icon="ph:check-square" width={48} height={48} />
        <p>No tasks yet.</p>
        <p class="empty-sub">Create your first task to get started!</p>
        <button class="cta-btn" onclick={() => tasksStore.openCreateModal()}>
          <Icon icon="ph:plus" width={16} height={16} />
          New Task
        </button>
      </div>
    {:else if !hasFilteredTasks}
      <div class="empty-state">
        <Icon icon="ph:funnel" width={48} height={48} />
        <p>No tasks match your filters.</p>
        <button class="clear-btn" onclick={() => tasksStore.clearFilters()}>Clear filters</button>
      </div>
    {:else if tasksStore.viewMode === 'board'}
      <TaskBoardView />
    {:else}
      <TaskListView />
    {/if}
  </div>
</div>

<TaskModal />

<style>
  .tasks-page {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    margin: calc(-1 * var(--space-6));
  }

  .tasks-body {
    flex: 1;
    overflow: hidden;
    padding: var(--space-4);
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-3);
    height: 100%;
    color: var(--color-text-tertiary);
    text-align: center;
  }

  .empty-state p {
    font-size: var(--text-base);
    color: var(--color-text-secondary);
  }

  .empty-sub {
    font-size: var(--text-sm) !important;
    color: var(--color-text-tertiary) !important;
  }

  .cta-btn {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-5);
    background: var(--color-accent-primary);
    color: #fff;
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    font-weight: 500;
    transition: background var(--transition-fast);
    margin-top: var(--space-2);
  }

  .cta-btn:hover { background: var(--color-accent-primary-hover); }

  .clear-btn {
    font-size: var(--text-sm);
    color: var(--color-accent-primary);
    text-decoration: underline;
    text-underline-offset: 2px;
  }
</style>
