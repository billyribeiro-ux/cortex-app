<script lang="ts">
  import type { Task } from '$lib/types/index.js';
  import { TASK_PRIORITY_CONFIG, TASK_STATUS_CONFIG } from '$lib/types/index.js';
  import { getDueDateLabel } from '$lib/utils/time.js';
  import Icon from '@iconify/svelte';

  interface Props {
    task: Task;
    compact?: boolean;
    onclick: () => void;
  }

  let { task, compact = false, onclick }: Props = $props();

  const priorityCfg = $derived(TASK_PRIORITY_CONFIG[task.priority]);
  const dueLabel = $derived(getDueDateLabel(task.dueDate));
  const completedSubtasks = $derived(task.subtasks.filter((s) => s.isCompleted).length);
  const subtaskProgress = $derived(task.subtasks.length > 0 ? (completedSubtasks / task.subtasks.length) * 100 : 0);
  const visibleTags = $derived(task.tags.slice(0, 3));
  const extraTags = $derived(Math.max(0, task.tags.length - 3));
  const isDone = $derived(task.status === 'done');
</script>

<div
  class="task-card"
  class:compact
  class:done={isDone}
  style:--priority-color={priorityCfg.color}
  role="button"
  tabindex="0"
  aria-label="Task: {task.title}"
  {onclick}
  onkeydown={(e) => e.key === 'Enter' && onclick()}
>
  <div class="card-top">
    <div class="priority-bar"></div>
    <div class="card-content">
      <div class="card-header">
        <span class="task-title" class:strikethrough={isDone}>{task.title}</span>
        {#if task.goalId}
          <span title="Linked to goal" class="goal-icon-wrap"><Icon icon="ph:target" width={12} height={12} /></span>
        {/if}
      </div>

      {#if task.dueDate}
        <span
          class="due-badge"
          class:overdue={dueLabel.isOverdue}
          class:today={dueLabel.isToday}
          class:soon={dueLabel.isSoon}
        >
          <Icon icon="ph:calendar" width={10} height={10} />
          {dueLabel.text}
        </span>
      {/if}

      {#if task.subtasks.length > 0}
        <div class="subtask-row">
          <span class="subtask-label">{completedSubtasks}/{task.subtasks.length}</span>
          <div class="subtask-bar">
            <div class="subtask-fill" style:width="{subtaskProgress}%"></div>
          </div>
        </div>
      {/if}

      {#if visibleTags.length > 0}
        <div class="tags-row">
          {#each visibleTags as tag}
            <span class="tag-pill">{tag}</span>
          {/each}
          {#if extraTags > 0}
            <span class="tag-pill muted">+{extraTags}</span>
          {/if}
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .task-card {
    background: var(--color-bg-elevated);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-lg);
    cursor: pointer;
    transition: box-shadow var(--transition-normal), border-color var(--transition-normal), transform var(--transition-normal);
    overflow: hidden;
    display: flex;
    box-shadow: var(--shadow-xs);
    will-change: transform, box-shadow;
  }

  .task-card:hover {
    box-shadow: var(--shadow-md);
    border-color: var(--color-border-default);
    transform: translateY(-1px);
  }

  .task-card:active {
    transform: scale(0.98);
    box-shadow: var(--shadow-xs);
    transition-duration: 80ms;
  }

  .task-card:focus-visible {
    outline: none;
    box-shadow: var(--shadow-glow);
    border-color: var(--color-accent-primary);
  }

  .task-card.done {
    opacity: 0.55;
  }

  .task-card.done:hover {
    opacity: 0.7;
  }

  .card-top {
    display: flex;
    flex: 1;
    min-width: 0;
    flex-direction: column;
  }

  .priority-bar {
    height: 3px;
    background: var(--priority-color);
    flex-shrink: 0;
    border-radius: var(--radius-full) var(--radius-full) 0 0;
  }

  .card-content {
    flex: 1;
    padding: var(--space-3);
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    min-width: 0;
  }

  .task-card.compact .card-content {
    padding: var(--space-2) var(--space-3);
    gap: var(--space-1-5);
  }

  .card-header {
    display: flex;
    align-items: flex-start;
    gap: var(--space-2);
  }

  .task-title {
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
    color: var(--color-text-primary);
    line-height: 1.4;
    word-break: break-word;
    flex: 1;
    letter-spacing: var(--tracking-sm);
  }

  .task-title.strikethrough {
    text-decoration: line-through;
    text-decoration-color: var(--color-text-quaternary);
    color: var(--color-text-tertiary);
  }

  .goal-icon-wrap {
    color: var(--color-accent-secondary);
    flex-shrink: 0;
    margin-top: 2px;
    display: flex;
    align-items: center;
    opacity: 0.6;
    transition: opacity var(--transition-fast), color var(--transition-fast);
  }

  .task-card:hover .goal-icon-wrap {
    opacity: 1;
  }

  .due-badge {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    font-size: var(--text-xs);
    color: var(--color-text-tertiary);
    font-weight: var(--weight-medium);
    padding: var(--space-0-5) var(--space-1-5);
    border-radius: var(--radius-xs);
    letter-spacing: var(--tracking-xs);
    width: fit-content;
    transition: color var(--transition-fast), background var(--transition-fast);
  }

  .due-badge.overdue {
    color: var(--color-accent-danger);
    background: var(--color-accent-danger-muted);
    font-weight: var(--weight-semibold);
  }

  .due-badge.today {
    color: var(--color-accent-warning);
    background: var(--color-accent-warning-muted);
    font-weight: var(--weight-semibold);
  }

  .due-badge.soon {
    color: var(--color-accent-warning);
    background: var(--color-accent-warning-muted);
  }

  .subtask-row {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .subtask-label {
    font-size: var(--text-xs);
    color: var(--color-text-tertiary);
    white-space: nowrap;
    font-weight: var(--weight-medium);
    letter-spacing: var(--tracking-xs);
    font-variant-numeric: tabular-nums;
  }

  .subtask-bar {
    flex: 1;
    height: 3px;
    background: var(--color-bg-tertiary);
    border-radius: var(--radius-full);
    overflow: hidden;
  }

  .subtask-fill {
    height: 100%;
    background: var(--color-accent-success);
    border-radius: var(--radius-full);
    transition: width var(--transition-slow);
  }

  .tags-row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1);
    padding-top: var(--space-0-5);
  }

  .tag-pill {
    padding: var(--space-0-5) var(--space-1-5);
    background: var(--color-bg-tertiary);
    color: var(--color-text-tertiary);
    border-radius: var(--radius-xs);
    font-size: var(--text-xs);
    letter-spacing: var(--tracking-xs);
    line-height: 1.4;
    font-weight: var(--weight-medium);
    border: 1px solid transparent;
    transition: border-color var(--transition-fast), background var(--transition-fast);
  }

  .task-card:hover .tag-pill {
    border-color: var(--color-border-subtle);
  }

  .tag-pill.muted {
    color: var(--color-text-quaternary);
    font-weight: var(--weight-medium);
  }
</style>
