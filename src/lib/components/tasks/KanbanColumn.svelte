<script lang="ts">
  import type { Task, TaskStatus } from '$lib/types/index.js';
  import { TASK_STATUS_CONFIG } from '$lib/types/index.js';
  import { tasksStore } from '$lib/stores/tasks.svelte.js';
  import TaskCard from './TaskCard.svelte';
  import Icon from '@iconify/svelte';

  interface Props {
    status: TaskStatus;
    tasks: Task[];
    onAddTask: () => void;
  }

  let { status, tasks, onAddTask }: Props = $props();

  const cfg = $derived(TASK_STATUS_CONFIG[status]);
  let isDragOver = $state(false);

  function handleDragOver(e: DragEvent): void {
    e.preventDefault();
    isDragOver = true;
  }

  function handleDragLeave(): void {
    isDragOver = false;
  }

  function handleDrop(e: DragEvent): void {
    e.preventDefault();
    isDragOver = false;
    const taskId = e.dataTransfer?.getData('text/plain');
    if (taskId) {
      tasksStore.moveToStatus(taskId, status);
    }
  }

  function handleDragStart(e: DragEvent, taskId: string): void {
    e.dataTransfer?.setData('text/plain', taskId);
  }
</script>

<div
  class="kanban-col"
  class:drag-over={isDragOver}
  style:--col-color={cfg.color}
  role="region"
  aria-label="{cfg.label} column"
  ondragover={handleDragOver}
  ondragleave={handleDragLeave}
  ondrop={handleDrop}
>
  <div class="col-header">
    <div class="col-title">
      <Icon icon={cfg.icon} width={16} height={16} style="color: {cfg.color}" />
      <span>{cfg.label}</span>
    </div>
    <span class="col-count">{tasks.length}</span>
  </div>

  <div class="col-cards">
    {#each tasks as task (task.id)}
      <div
        draggable="true"
        role="listitem"
        ondragstart={(e) => handleDragStart(e, task.id)}
      >
        <TaskCard
          {task}
          onclick={() => tasksStore.openEditModal(task.id)}
        />
      </div>
    {/each}

    {#if tasks.length === 0}
      <div class="empty-col">
        <p>Drop tasks here</p>
      </div>
    {/if}
  </div>

  <button class="add-task-btn" onclick={onAddTask}>
    <Icon icon="ph:plus" width={14} height={14} />
    Add task
  </button>
</div>

<style>
  .kanban-col {
    display: flex;
    flex-direction: column;
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-xl);
    min-width: 260px;
    flex: 1;
    max-height: 100%;
    transition: border-color var(--transition-normal), background var(--transition-normal), box-shadow var(--transition-normal);
  }

  .kanban-col.drag-over {
    border-color: var(--col-color);
    border-style: dashed;
    background: color-mix(in srgb, var(--col-color) 4%, var(--color-bg-secondary));
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--col-color) 10%, transparent);
  }

  .col-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-3) var(--space-4);
    border-bottom: 1px solid var(--color-border-subtle);
    flex-shrink: 0;
  }

  .col-title {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--text-xs);
    font-weight: var(--weight-semibold);
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: var(--tracking-xs);
  }

  .col-count {
    font-size: var(--text-xs);
    color: var(--color-text-tertiary);
    background: var(--color-bg-elevated);
    padding: var(--space-0-5) var(--space-2);
    border-radius: var(--radius-full);
    font-weight: var(--weight-semibold);
    min-width: 20px;
    text-align: center;
    font-variant-numeric: tabular-nums;
    line-height: 1.4;
  }

  .col-cards {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-3);
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    min-height: 80px;
    scroll-behavior: smooth;
  }

  .col-cards::-webkit-scrollbar {
    width: 4px;
  }

  .col-cards::-webkit-scrollbar-track {
    background: transparent;
  }

  .col-cards::-webkit-scrollbar-thumb {
    background: var(--color-border-subtle);
    border-radius: var(--radius-full);
  }

  .col-cards::-webkit-scrollbar-thumb:hover {
    background: var(--color-border-default);
  }

  .empty-col {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 64px;
    color: var(--color-text-quaternary);
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    letter-spacing: var(--tracking-sm);
    border: 1px dashed var(--color-border-default);
    border-radius: var(--radius-lg);
    transition: border-color var(--transition-fast), color var(--transition-fast);
  }

  .kanban-col.drag-over .empty-col {
    border-color: var(--col-color);
    color: var(--color-text-tertiary);
  }

  .add-task-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-1-5);
    width: 100%;
    padding: var(--space-2) var(--space-4);
    min-height: 40px;
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    color: var(--color-text-tertiary);
    letter-spacing: var(--tracking-sm);
    border-top: 1px solid var(--color-border-subtle);
    border-radius: 0 0 var(--radius-xl) var(--radius-xl);
    transition: background var(--transition-fast), color var(--transition-fast);
    flex-shrink: 0;
  }

  .add-task-btn:hover {
    background: var(--color-bg-hover);
    color: var(--color-accent-primary);
  }

  .add-task-btn:active {
    background: var(--color-bg-active);
  }
</style>
