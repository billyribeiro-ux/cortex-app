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
    border-radius: var(--radius-lg);
    min-width: 260px;
    flex: 1;
    max-height: 100%;
    transition: border-color var(--transition-fast);
  }

  .kanban-col.drag-over {
    border-color: var(--col-color);
    border-style: dashed;
    background: color-mix(in srgb, var(--col-color) 5%, var(--color-bg-secondary));
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
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .col-count {
    font-size: var(--text-xs);
    color: var(--color-text-tertiary);
    background: var(--color-bg-elevated);
    padding: 1px var(--space-2);
    border-radius: var(--radius-sm);
    font-weight: 600;
  }

  .col-cards {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-3);
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    min-height: 80px;
  }

  .empty-col {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 60px;
    color: var(--color-text-tertiary);
    font-size: var(--text-xs);
    border: 1px dashed var(--color-border-subtle);
    border-radius: var(--radius-md);
  }

  .add-task-btn {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    width: 100%;
    padding: var(--space-2) var(--space-4);
    font-size: var(--text-xs);
    color: var(--color-text-tertiary);
    border-top: 1px solid var(--color-border-subtle);
    transition: background var(--transition-fast), color var(--transition-fast);
    flex-shrink: 0;
  }

  .add-task-btn:hover {
    background: var(--color-bg-hover);
    color: var(--color-text-primary);
  }
</style>
