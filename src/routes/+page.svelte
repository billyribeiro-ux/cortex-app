<script lang="ts">
  import { appStore } from '$lib/stores/app.svelte.js';
  import { tasksStore } from '$lib/stores/tasks.svelte.js';
  import { goalsStore } from '$lib/stores/goals.svelte.js';
  import ProgressBar from '$lib/components/ui/ProgressBar.svelte';

  const nearestGoal = $derived.by(() => {
    const active = appStore.goals.filter((g) => g.status === 'active' && g.targetDate !== null);
    if (active.length === 0) return null;
    return active.sort((a, b) =>
      new Date(a.targetDate!).getTime() - new Date(b.targetDate!).getTime()
    )[0] ?? null;
  });

  const avgProgress = $derived.by(() => {
    const active = appStore.goals.filter((g) => g.status === 'active');
    if (active.length === 0) return 0;
    const total = active.reduce((sum, g) => sum + goalsStore.calculateProgress(g), 0);
    return Math.round(total / active.length);
  });

  const topActiveGoals = $derived(
    appStore.goals.filter((g) => g.status === 'active').slice(0, 3)
  );
</script>

<div class="dashboard">
  <h1 class="dashboard-title">Welcome to Cortex</h1>
  <div class="stats">
    <div class="stat-card">
      <span class="stat-value">{appStore.noteCount}</span>
      <span class="stat-label">Notes</span>
    </div>
    <div class="stat-card">
      <span class="stat-value">{appStore.openTaskCount}</span>
      <span class="stat-label">Open Tasks</span>
      <div class="stat-breakdown">
        <span>{tasksStore.statusCounts['todo']} to do</span>
        <span>·</span>
        <span>{tasksStore.statusCounts['in-progress']} in progress</span>
        <span>·</span>
        <span>{tasksStore.statusCounts['review']} in review</span>
      </div>
    </div>
    <div class="stat-card" class:danger={tasksStore.overdueCount > 0}>
      <span class="stat-value" class:overdue={tasksStore.overdueCount > 0}>{tasksStore.overdueCount}</span>
      <span class="stat-label">Overdue</span>
    </div>
    <div class="stat-card">
      <span class="stat-value">{appStore.activeGoalCount}</span>
      <span class="stat-label">Active Goals</span>
      {#if appStore.activeGoalCount > 0}
        <div class="stat-breakdown">
          <span>Avg progress: {avgProgress}%</span>
        </div>
      {/if}
    </div>
  </div>

  {#if topActiveGoals.length > 0}
    <div class="goals-section">
      <h2 class="section-title">Active Goals</h2>
      <div class="goals-list">
        {#each topActiveGoals as goal (goal.id)}
          {@const progress = goalsStore.calculateProgress(goal)}
          <div class="goal-row">
            <div class="goal-color-dot" style:background={goal.color}></div>
            <div class="goal-row-info">
              <span class="goal-row-title">{goal.title}</span>
              {#if goal.targetDate}
                <span class="goal-row-date">
                  {new Date(goal.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              {/if}
            </div>
            <div class="goal-row-progress">
              <ProgressBar {progress} color={goal.color} height={4} showLabel={true} />
            </div>
          </div>
        {/each}
      </div>
      {#if nearestGoal}
        <p class="nearest-deadline">
          Nearest deadline: <strong>{nearestGoal.title}</strong>
          {#if nearestGoal.targetDate}
            — {new Date(nearestGoal.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          {/if}
        </p>
      {/if}
    </div>
  {/if}
</div>

<style>
  .dashboard {
    display: flex;
    flex-direction: column;
    gap: var(--space-8);
  }

  .dashboard-title {
    font-size: var(--text-3xl);
    font-weight: 700;
    color: var(--color-text-primary);
    letter-spacing: -0.03em;
  }

  .stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--space-4);
  }

  .stat-card {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    padding: var(--space-6);
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-xl);
    transition: border-color var(--transition-fast);
  }

  .stat-card:hover {
    border-color: var(--color-border-default);
  }

  .stat-card.danger {
    border-color: rgba(225, 112, 85, 0.3);
  }

  .stat-value {
    font-size: var(--text-3xl);
    font-weight: 700;
    color: var(--color-accent-primary);
    letter-spacing: -0.03em;
    font-variant-numeric: tabular-nums;
  }

  .stat-value.overdue {
    color: var(--color-accent-danger);
  }

  .stat-label {
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
    font-weight: 500;
  }

  .stat-breakdown {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    font-size: var(--text-xs);
    color: var(--color-text-tertiary);
    flex-wrap: wrap;
  }

  .goals-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .section-title {
    font-size: var(--text-lg);
    font-weight: 700;
    color: var(--color-text-primary);
    letter-spacing: -0.01em;
  }

  .goals-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .goal-row {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-4);
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-lg);
    transition: border-color var(--transition-fast);
  }

  .goal-row:hover {
    border-color: var(--color-border-default);
  }

  .goal-color-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .goal-row-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 160px;
    flex-shrink: 0;
  }

  .goal-row-title {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .goal-row-date {
    font-size: var(--text-xs);
    color: var(--color-text-tertiary);
  }

  .goal-row-progress {
    flex: 1;
  }

  .nearest-deadline {
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
  }

  .nearest-deadline strong {
    color: var(--color-text-primary);
  }
</style>
