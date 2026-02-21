<script lang="ts">
  import { appStore } from '$lib/stores/app.svelte.js';
  import { TASK_PRIORITY_CONFIG, TASK_STATUS_CONFIG } from '$lib/types/index.js';
  import Icon from '@iconify/svelte';

  interface Props {
    goalId: string;
    onclose: () => void;
  }

  let { goalId, onclose }: Props = $props();

  let searchQuery = $state('');
  let wrapEl = $state<HTMLDivElement | null>(null);

  const unlinkedTasks = $derived(
    appStore.tasks.filter((t) => t.goalId === null)
  );

  const filteredTasks = $derived(
    searchQuery.trim()
      ? unlinkedTasks.filter((t) =>
          t.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : unlinkedTasks
  );

  function linkTask(taskId: string): void {
    appStore.updateTask(taskId, { goalId });
    onclose();
  }

  function handleOutsideClick(e: MouseEvent): void {
    if (wrapEl && !wrapEl.contains(e.target as Node)) onclose();
  }
</script>

<svelte:window onclick={handleOutsideClick} />

<div class="dropdown" bind:this={wrapEl}>
  <div class="search-wrap">
    <Icon icon="ph:magnifying-glass" width={14} height={14} />
    <input
      class="search-input selectable"
      type="text"
      placeholder="Search tasks..."
      bind:value={searchQuery}
    />
  </div>

  <div class="task-list">
    {#if filteredTasks.length === 0}
      <div class="empty">
        {#if unlinkedTasks.length === 0}
          <p>All tasks are already linked to goals.</p>
        {:else}
          <p>No tasks match your search.</p>
        {/if}
      </div>
    {:else}
      {#each filteredTasks as task (task.id)}
        {@const priorityCfg = TASK_PRIORITY_CONFIG[task.priority]}
        {@const statusCfg = TASK_STATUS_CONFIG[task.status]}
        <button class="task-row" onclick={() => linkTask(task.id)}>
          <span style:color={priorityCfg.color}>
            <Icon icon={priorityCfg.icon} width={12} height={12} />
          </span>
          <span class="task-title">{task.title}</span>
          <span style:color={statusCfg.color}>
            <Icon icon={statusCfg.icon} width={12} height={12} />
          </span>
        </button>
      {/each}
    {/if}
  </div>
</div>

<style>
  .dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    width: 300px;
    background: var(--color-bg-elevated);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    z-index: 300;
    overflow: hidden;
  }

  .search-wrap {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    border-bottom: 1px solid var(--color-border-subtle);
    color: var(--color-text-tertiary);
  }

  .search-input {
    flex: 1;
    font-size: var(--text-xs);
    color: var(--color-text-primary);
    background: transparent;
    border: none;
    outline: none;
  }

  .search-input::placeholder {
    color: var(--color-text-tertiary);
  }

  .task-list {
    max-height: 240px;
    overflow-y: auto;
  }

  .empty {
    padding: var(--space-4);
    text-align: center;
    font-size: var(--text-xs);
    color: var(--color-text-tertiary);
  }

  .task-row {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    width: 100%;
    padding: var(--space-2) var(--space-3);
    font-size: var(--text-xs);
    transition: background var(--transition-fast);
    text-align: left;
  }

  .task-row:hover {
    background: var(--color-bg-hover);
  }

  .task-title {
    flex: 1;
    color: var(--color-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
