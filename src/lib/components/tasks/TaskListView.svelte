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
  }

  .list-header {
    display: grid;
    grid-template-columns: 40px 36px 1fr 110px 90px 120px;
    align-items: center;
    padding: var(--space-2) var(--space-4);
    border-bottom: 1px solid var(--color-border-subtle);
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--color-text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    flex-shrink: 0;
    position: sticky;
    top: 0;
    background: var(--color-bg-primary);
    z-index: 1;
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
    font-weight: 600;
    color: var(--color-text-secondary);
    background: var(--color-bg-secondary);
    border-bottom: 1px solid var(--color-border-subtle);
    cursor: pointer;
    transition: background var(--transition-fast);
  }

  .group-header:hover {
    background: var(--color-bg-hover);
  }

  .group-count {
    background: var(--color-bg-elevated);
    color: var(--color-text-tertiary);
    padding: 1px var(--space-2);
    border-radius: var(--radius-sm);
    font-size: var(--text-xs);
  }

  .list-row {
    display: grid;
    grid-template-columns: 40px 36px 1fr 110px 90px 120px;
    align-items: center;
    padding: var(--space-2) var(--space-4);
    border-bottom: 1px solid var(--color-border-subtle);
    cursor: pointer;
    transition: background var(--transition-fast);
    min-height: 40px;
  }

  .list-row:hover {
    background: var(--color-bg-hover);
  }

  .list-row.done {
    opacity: 0.6;
  }

  .status-cycle-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: var(--radius-sm);
    transition: background var(--transition-fast);
  }

  .status-cycle-btn:hover {
    background: var(--color-bg-hover);
  }

  .task-title {
    font-size: var(--text-sm);
    color: var(--color-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding-right: var(--space-4);
  }

  .task-title.strikethrough {
    text-decoration: line-through;
    color: var(--color-text-tertiary);
  }

  .due-label {
    font-size: var(--text-xs);
    font-weight: 500;
    color: var(--color-text-tertiary);
  }

  .due-label.overdue { color: var(--color-accent-danger); }
  .due-label.today { color: var(--color-accent-warning); }
  .due-label.soon { color: var(--color-accent-warning); opacity: 0.8; }

  .no-due {
    color: var(--color-text-tertiary);
    font-size: var(--text-xs);
  }

  .subtask-text {
    font-size: var(--text-xs);
    color: var(--color-text-tertiary);
    margin-right: var(--space-1);
  }

  .mini-bar {
    display: inline-block;
    width: 40px;
    height: 3px;
    background: var(--color-bg-tertiary);
    border-radius: 2px;
    overflow: hidden;
    vertical-align: middle;
  }

  .mini-fill {
    height: 100%;
    background: var(--color-accent-success);
    border-radius: 2px;
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
    padding: 1px var(--space-2);
    background: var(--color-bg-tertiary);
    color: var(--color-text-tertiary);
    border-radius: var(--radius-sm);
    font-size: var(--text-xs);
  }

  .tag-pill.muted { opacity: 0.7; }
</style>
