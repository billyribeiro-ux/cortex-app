<script lang="ts">
  import type { TaskStatus } from '$lib/types/index.js';
  import { TASK_STATUS_CONFIG, TASK_PRIORITY_CONFIG } from '$lib/types/index.js';
  import { tasksStore } from '$lib/stores/tasks.svelte.js';
  import { getDueDateLabel } from '$lib/utils/time.js';
  import Icon from '@iconify/svelte';

  const statuses: TaskStatus[] = ['todo', 'in-progress', 'review', 'done'];

  const statusOrder: Record<TaskStatus, number> = { 'todo': 0, 'in-progress': 1, 'review': 2, 'done': 3 };
  const nextStatus: Record<TaskStatus, TaskStatus> = {
    'todo': 'in-progress',
    'in-progress': 'review',
    'review': 'done',
    'done': 'todo',
  };

  let collapsed = $state<Record<TaskStatus, boolean>>({ 'todo': false, 'in-progress': false, 'review': false, 'done': false });

  function cycleStatus(taskId: string, current: TaskStatus): void {
    tasksStore.moveToStatus(taskId, nextStatus[current]);
  }
</script>

<div class="list-view">
  <div class="list-header">
    <span class="col-status">Status</span>
    <span class="col-priority">Pri</span>
    <span class="col-title">Title</span>
    <span class="col-due">Due</span>
    <span class="col-subtasks">Subtasks</span>
    <span class="col-tags">Tags</span>
  </div>

  {#each statuses as status}
    {@const groupTasks = tasksStore.tasksByStatus[status]}
    {@const cfg = TASK_STATUS_CONFIG[status]}
    {#if groupTasks.length > 0}
      <div class="group">
        <button
          class="group-header"
          onclick={() => { collapsed[status] = !collapsed[status]; }}
        >
          <Icon
            icon={collapsed[status] ? 'ph:caret-right' : 'ph:caret-down'}
            width={14} height={14}
          />
          <Icon icon={cfg.icon} width={14} height={14} style="color: {cfg.color}" />
          <span style:color={cfg.color}>{cfg.label}</span>
          <span class="group-count">{groupTasks.length}</span>
        </button>

        {#if !collapsed[status]}
          {#each groupTasks as task (task.id)}
            {@const priorityCfg = TASK_PRIORITY_CONFIG[task.priority]}
            {@const dueLabel = getDueDateLabel(task.dueDate)}
            {@const completedSubs = task.subtasks.filter((s) => s.isCompleted).length}
            <div class="list-row" class:done={task.status === 'done'} onclick={() => tasksStore.openEditModal(task.id)} role="button" tabindex="0" onkeydown={(e) => e.key === 'Enter' && tasksStore.openEditModal(task.id)}>
              <span class="col-status">
                <button
                  class="status-cycle-btn"
                  style:color={cfg.color}
                  onclick={(e) => { e.stopPropagation(); cycleStatus(task.id, task.status); }}
                  aria-label="Cycle status"
                  title={cfg.label}
                >
                  <Icon icon={cfg.icon} width={16} height={16} />
                </button>
              </span>
              <span class="col-priority">
                <span style:color={priorityCfg.color} title={priorityCfg.label}>
                  <Icon icon={priorityCfg.icon} width={14} height={14} />
                </span>
              </span>
              <span class="col-title task-title" class:strikethrough={task.status === 'done'}>
                {task.title}
              </span>
              <span class="col-due">
                {#if task.dueDate}
                  <span
                    class="due-label"
                    class:overdue={dueLabel.isOverdue}
                    class:today={dueLabel.isToday}
                    class:soon={dueLabel.isSoon}
                  >{dueLabel.text}</span>
                {:else}
                  <span class="no-due">—</span>
                {/if}
              </span>
              <span class="col-subtasks">
                {#if task.subtasks.length > 0}
                  <span class="subtask-text">{completedSubs}/{task.subtasks.length}</span>
                  <div class="mini-bar">
                    <div class="mini-fill" style:width="{task.subtasks.length > 0 ? (completedSubs / task.subtasks.length) * 100 : 0}%"></div>
                  </div>
                {:else}
                  <span class="no-due">—</span>
                {/if}
              </span>
              <span class="col-tags">
                {#each task.tags.slice(0, 2) as tag}
                  <span class="tag-pill">{tag}</span>
                {/each}
                {#if task.tags.length > 2}
                  <span class="tag-pill muted">+{task.tags.length - 2}</span>
                {/if}
              </span>
            </div>
          {/each}
        {/if}
      </div>
    {/if}
  {/each}
</div>

<style>
  .list-view {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow-y: auto;
    scroll-behavior: smooth;
  }

  .list-header {
    display: grid;
    grid-template-columns: 40px 36px 1fr 110px 90px 120px;
    align-items: center;
    padding: var(--space-2) var(--space-4);
    border-bottom: 1px solid var(--color-border-default);
    font-size: var(--text-xs);
    font-weight: var(--weight-semibold);
    color: var(--color-text-tertiary);
    text-transform: uppercase;
    letter-spacing: var(--tracking-xs);
    flex-shrink: 0;
    position: sticky;
    top: 0;
    background: var(--color-bg-primary);
    z-index: 1;
    backdrop-filter: blur(8px);
  }

  .group {
    display: flex;
    flex-direction: column;
  }

  .group-header {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-4);
    font-size: var(--text-xs);
    font-weight: var(--weight-semibold);
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: var(--tracking-xs);
    background: var(--color-bg-secondary);
    border-bottom: 1px solid var(--color-border-subtle);
    cursor: pointer;
    transition: background var(--transition-fast), color var(--transition-fast);
  }

  .group-header:hover {
    background: var(--color-bg-hover);
    color: var(--color-text-primary);
  }

  .group-count {
    background: var(--color-bg-elevated);
    color: var(--color-text-tertiary);
    padding: var(--space-0-5) var(--space-2);
    border-radius: var(--radius-full);
    font-size: var(--text-xs);
    font-weight: var(--weight-semibold);
    min-width: 20px;
    text-align: center;
    font-variant-numeric: tabular-nums;
  }

  .list-row {
    display: grid;
    grid-template-columns: 40px 36px 1fr 110px 90px 120px;
    align-items: center;
    padding: var(--space-2) var(--space-4);
    border-bottom: 1px solid var(--color-border-subtle);
    cursor: pointer;
    transition: background var(--transition-fast);
    min-height: 44px;
  }

  .list-row:hover {
    background: var(--color-bg-hover);
    border-radius: var(--radius-md);
  }

  .list-row:active {
    background: var(--color-bg-active);
  }

  .list-row:focus-visible {
    outline: none;
    box-shadow: inset 0 0 0 2px var(--color-accent-primary);
    border-radius: var(--radius-md);
  }

  .list-row.done {
    opacity: 0.55;
  }

  .list-row.done:hover {
    opacity: 0.7;
  }

  .status-cycle-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: var(--radius-md);
    transition: background var(--transition-fast), transform var(--transition-fast), box-shadow var(--transition-fast);
  }

  .status-cycle-btn:hover {
    background: var(--color-bg-hover);
    box-shadow: var(--shadow-xs);
  }

  .status-cycle-btn:active {
    transform: scale(0.9);
    background: var(--color-bg-active);
  }

  .task-title {
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
    color: var(--color-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding-right: var(--space-4);
    letter-spacing: var(--tracking-sm);
  }

  .task-title.strikethrough {
    text-decoration: line-through;
    text-decoration-color: var(--color-text-quaternary);
    color: var(--color-text-tertiary);
  }

  .due-label {
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    color: var(--color-text-tertiary);
    letter-spacing: var(--tracking-xs);
    padding: var(--space-0-5) var(--space-1-5);
    border-radius: var(--radius-xs);
    transition: background var(--transition-fast);
  }

  .due-label.overdue {
    color: var(--color-accent-danger);
    background: var(--color-accent-danger-muted);
    font-weight: var(--weight-semibold);
  }

  .due-label.today {
    color: var(--color-accent-warning);
    background: color-mix(in srgb, var(--color-accent-warning) 12%, transparent);
    font-weight: var(--weight-semibold);
  }

  .due-label.soon {
    color: var(--color-accent-warning);
    background: color-mix(in srgb, var(--color-accent-warning) 6%, transparent);
  }

  .no-due {
    color: var(--color-text-quaternary);
    font-size: var(--text-xs);
  }

  .subtask-text {
    font-size: var(--text-xs);
    color: var(--color-text-tertiary);
    margin-right: var(--space-1);
    font-weight: var(--weight-medium);
    font-variant-numeric: tabular-nums;
    letter-spacing: var(--tracking-xs);
  }

  .mini-bar {
    display: inline-block;
    width: 40px;
    height: 3px;
    background: var(--color-bg-tertiary);
    border-radius: var(--radius-full);
    overflow: hidden;
    vertical-align: middle;
  }

  .mini-fill {
    height: 100%;
    background: var(--color-accent-success);
    border-radius: var(--radius-full);
    transition: width var(--transition-slow);
  }

  .col-subtasks {
    display: flex;
    align-items: center;
    gap: var(--space-1);
  }

  .col-tags {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    flex-wrap: wrap;
  }

  .tag-pill {
    padding: var(--space-0-5) var(--space-2);
    background: var(--color-bg-tertiary);
    color: var(--color-text-tertiary);
    border-radius: var(--radius-xs);
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    letter-spacing: var(--tracking-xs);
    line-height: 1.4;
  }

  .tag-pill.muted {
    color: var(--color-text-quaternary);
  }

  @media (max-width: 768px) {
    .list-header {
      grid-template-columns: 40px 36px 1fr 110px;
    }

    .list-row {
      grid-template-columns: 40px 36px 1fr 110px;
    }

    .col-subtasks,
    .col-tags {
      display: none;
    }

    .list-header .col-subtasks,
    .list-header .col-tags {
      display: none;
    }
  }
</style>
