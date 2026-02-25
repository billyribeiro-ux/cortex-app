<script lang="ts">
  import type { Goal } from '$lib/types/index.js';
  import { GOAL_STATUS_CONFIG } from '$lib/types/index.js';
  import { goalsStore } from '$lib/stores/goals.svelte.js';
  import { notesStore } from '$lib/stores/notes.svelte.js';
  import { getRelativeTime } from '$lib/utils/time.js';
  import ProgressRing from '$lib/components/ui/ProgressRing.svelte';
  import Icon from '@iconify/svelte';

  interface Props {
    goal: Goal;
    onclick: () => void;
  }

  let { goal, onclick }: Props = $props();

  const statusCfg = $derived(GOAL_STATUS_CONFIG[goal.status]);
  const progress = $derived(goalsStore.calculateProgress(goal));
  const linkedTasks = $derived(goalsStore.getLinkedTasks(goal.id));
  const completedTasks = $derived(linkedTasks.filter((t) => t.status === 'done').length);
  const completedMilestones = $derived(goal.milestones.filter((m) => m.isCompleted).length);
  const category = $derived(notesStore.categories.find((c) => c.id === goal.category));
  const categoryColor = $derived(category?.color ?? '#6c5ce7');
  const categoryName = $derived(category?.name ?? goal.category);
  const relTime = $derived(getRelativeTime(goal.updatedAt));
</script>

<div
  class="goal-card"
  class:completed={goal.status === 'completed'}
  class:abandoned={goal.status === 'abandoned'}
  role="button"
  tabindex="0"
  aria-label="Goal: {goal.title}"
  {onclick}
  onkeydown={(e) => e.key === 'Enter' && onclick()}
>
  <div class="color-bar" style:background={goal.color}></div>

  <div class="card-body">
    <div class="card-header">
      <span class="goal-title">{goal.title}</span>
      <span class="status-badge" style:color={statusCfg.color} style:background="color-mix(in srgb, {statusCfg.color} 12%, transparent)">
        <Icon icon={statusCfg.icon} width={12} height={12} />
        {statusCfg.label}
      </span>
    </div>

    {#if goal.description}
      <p class="goal-desc">{goal.description}</p>
    {/if}

    <div class="progress-section">
      <ProgressRing {progress} size={56} strokeWidth={5} color={goal.color} />
      <div class="progress-stats">
        <div class="stat-row">
          <Icon icon="ph:flag-checkered" width={12} height={12} />
          <span>{completedMilestones}/{goal.milestones.length} milestones</span>
        </div>
        <div class="stat-row">
          <Icon icon="ph:check-square" width={12} height={12} />
          <span>{completedTasks}/{linkedTasks.length} tasks</span>
        </div>
        {#if goal.targetDate}
          <div class="stat-row">
            <Icon icon="ph:calendar" width={12} height={12} />
            <span>{new Date(goal.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
        {/if}
      </div>
    </div>

    <div class="card-footer">
      <div class="category-row">
        <span class="cat-dot" style:background={categoryColor}></span>
        <span class="cat-name">{categoryName}</span>
      </div>
      <span class="rel-time">{relTime}</span>
    </div>
  </div>
</div>

<style>
  .goal-card {
    display: flex;
    flex-direction: column;
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-xl);
    overflow: hidden;
    cursor: pointer;
    box-shadow: var(--shadow-xs);
    transition:
      box-shadow var(--transition-normal),
      border-color var(--transition-normal),
      transform var(--transition-normal);
  }

  .goal-card:hover {
    box-shadow: var(--shadow-md);
    border-color: var(--color-border-default);
    transform: translateY(-2px);
  }

  .goal-card:active {
    transform: scale(0.98);
    transition: transform 0.1s var(--ease-out);
  }

  .goal-card.completed {
    background: var(--color-accent-success-muted);
  }

  .goal-card.abandoned {
    opacity: 0.55;
  }

  .color-bar {
    height: 3px;
    flex-shrink: 0;
  }

  .card-body {
    padding: var(--space-5);
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    flex: 1;
  }

  .card-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-2);
  }

  .goal-title {
    font-size: var(--text-base);
    font-weight: var(--weight-semibold);
    color: var(--color-text-primary);
    line-height: var(--leading-lg);
    flex: 1;
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px var(--space-2);
    border-radius: var(--radius-full);
    font-size: var(--text-xs);
    font-weight: var(--weight-semibold);
    white-space: nowrap;
    flex-shrink: 0;
  }

  .goal-desc {
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
    line-height: var(--leading-sm);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .progress-section {
    display: flex;
    align-items: center;
    gap: var(--space-4);
  }

  .progress-stats {
    display: flex;
    flex-direction: column;
    gap: var(--space-1-5);
    flex: 1;
  }

  .stat-row {
    display: flex;
    align-items: center;
    gap: var(--space-1-5);
    font-size: var(--text-xs);
    letter-spacing: var(--tracking-xs);
    color: var(--color-text-tertiary);
  }

  .card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: var(--space-3);
    border-top: 1px solid var(--color-border-subtle);
  }

  .category-row {
    display: flex;
    align-items: center;
    gap: var(--space-1-5);
  }

  .cat-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .cat-name {
    font-size: var(--text-xs);
    letter-spacing: var(--tracking-xs);
    color: var(--color-text-tertiary);
  }

  .rel-time {
    font-size: var(--text-xs);
    letter-spacing: var(--tracking-xs);
    color: var(--color-text-quaternary);
  }
</style>
