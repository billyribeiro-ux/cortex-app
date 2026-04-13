<script lang="ts">
  import { appStore } from '$lib/stores/app.svelte.js';
  import { tasksStore } from '$lib/stores/tasks.svelte.js';
  import TaskFilters from '$lib/components/tasks/TaskFilters.svelte';
  import TaskBoardView from '$lib/components/tasks/TaskBoardView.svelte';
  import TaskListView from '$lib/components/tasks/TaskListView.svelte';
  import TaskModal from '$lib/components/tasks/TaskModal.svelte';
  import Icon from '@iconify/svelte';
  import { fly } from 'svelte/transition';

  // Sync TopBar search → tasks filter
  $effect(() => {
    tasksStore.setSearchQuery(appStore.searchQuery);
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
      <div class="empty-state" in:fly={{ y: 20, duration: 400, delay: 100 }}>
        <div class="empty-icon-wrap">
          <Icon icon="ph:check-square" width={48} height={48} />
        </div>
        <div class="empty-text">
          <h3>No tasks yet</h3>
          <p class="empty-sub">Create your first task to get started!</p>
        </div>
        <button class="cta-btn" onclick={() => tasksStore.openCreateModal()}>
          <Icon icon="ph:plus" width={16} height={16} />
          New Task
        </button>
      </div>
    {:else if !hasFilteredTasks}
      <div class="empty-state" in:fly={{ y: 20, duration: 400 }}>
        <div class="empty-icon-wrap">
          <Icon icon="ph:funnel" width={48} height={48} />
        </div>
        <div class="empty-text">
          <h3>No tasks found</h3>
          <p class="empty-sub">Try adjusting your filters or search query.</p>
        </div>
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
    margin: calc(-1 * var(--space-8));
  }

  .tasks-body {
    flex: 1;
    overflow: hidden;
    padding: var(--space-5);
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-6);
    height: 100%;
    text-align: center;
  }

  .empty-icon-wrap {
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

  .empty-text {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .empty-text h3 {
    font-size: var(--text-lg);
    font-weight: var(--weight-semibold);
    color: var(--color-text-primary);
    margin: 0;
  }

  .empty-sub {
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
    max-width: 300px;
    line-height: var(--leading-base);
  }

  .cta-btn {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-5);
    min-height: 44px;
    background: var(--color-accent-primary);
    color: #fff;
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    font-weight: var(--weight-semibold);
    letter-spacing: var(--tracking-sm);
    box-shadow: var(--shadow-sm);
    transition: background var(--transition-fast), box-shadow var(--transition-fast), transform var(--transition-fast);
    margin-top: var(--space-2);
  }

  .cta-btn:hover {
    background: var(--color-accent-primary-hover);
    box-shadow: var(--shadow-md);
  }

  .cta-btn:active {
    transform: scale(0.97);
    box-shadow: var(--shadow-xs);
  }

  .clear-btn {
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
    letter-spacing: var(--tracking-sm);
    color: var(--color-accent-primary);
    text-decoration: underline;
    text-underline-offset: 3px;
    transition: opacity var(--transition-fast);
  }

  .clear-btn:hover {
    opacity: 0.8;
  }
</style>
