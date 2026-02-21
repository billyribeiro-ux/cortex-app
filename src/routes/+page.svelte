<script lang="ts">
  import { goto } from '$app/navigation';
  import { appStore } from '$lib/stores/app.svelte.js';
  import { tasksStore } from '$lib/stores/tasks.svelte.js';
  import { goalsStore } from '$lib/stores/goals.svelte.js';
  import { notesStore } from '$lib/stores/notes.svelte.js';
  import ProgressBar from '$lib/components/ui/ProgressBar.svelte';
  import Icon from '@iconify/svelte';

  const isEmpty = $derived(appStore.notes.length === 0 && appStore.tasks.length === 0 && appStore.goals.length === 0);

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

  {#if isEmpty}
    <div class="onboarding">
      <p class="onboarding-text">Get started by creating your first items.</p>
      <div class="onboarding-actions">
        <a href="/notes" class="onboarding-btn" onclick={() => { notesStore.createNote(); }}>
          <Icon icon="ph:note" width={20} height={20} />
          Create a Note
        </a>
        <a href="/tasks" class="onboarding-btn" onclick={() => { tasksStore.openCreateModal(); }}>
          <Icon icon="ph:check-square" width={20} height={20} />
          Add a Task
        </a>
        <a href="/goals" class="onboarding-btn" onclick={() => { goalsStore.openCreateModal(); }}>
          <Icon icon="ph:target" width={20} height={20} />
          Set a Goal
        </a>
      </div>
    </div>
  {:else}
    <div class="stats">
      <a href="/notes" class="stat-card">
        <span class="stat-value">{appStore.noteCount}</span>
        <span class="stat-label">Notes</span>
      </a>
      <a href="/tasks" class="stat-card">
        <span class="stat-value">{appStore.openTaskCount}</span>
        <span class="stat-label">Open Tasks</span>
        <div class="stat-breakdown">
          <span>{tasksStore.statusCounts['todo']} to do</span>
          <span>·</span>
          <span>{tasksStore.statusCounts['in-progress']} in progress</span>
          <span>·</span>
          <span>{tasksStore.statusCounts['review']} in review</span>
        </div>
      </a>
      <a href="/tasks" class="stat-card" class:danger={tasksStore.overdueCount > 0}>
        <span class="stat-value" class:overdue={tasksStore.overdueCount > 0}>{tasksStore.overdueCount}</span>
        <span class="stat-label">Overdue</span>
      </a>
      <a href="/goals" class="stat-card">
        <span class="stat-value">{appStore.activeGoalCount}</span>
        <span class="stat-label">Active Goals</span>
        {#if appStore.activeGoalCount > 0}
          <div class="stat-breakdown">
            <span>Avg progress: {avgProgress}%</span>
          </div>
        {/if}
      </a>
    </div>

    {#if topActiveGoals.length > 0}
      <div class="goals-section">
        <h2 class="section-title">Active Goals</h2>
        <div class="goals-list">
          {#each topActiveGoals as goal (goal.id)}
            {@const progress = goalsStore.calculateProgress(goal)}
            <button
              class="goal-row"
              onclick={() => { goalsStore.setActiveGoal(goal.id); void goto('/goals'); }}
            >
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
            </button>
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
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-4);
  }

  .onboarding {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-6);
    padding: var(--space-12) var(--space-6);
    text-align: center;
  }

  .onboarding-text {
    font-size: var(--text-base);
    color: var(--color-text-secondary);
  }

  .onboarding-actions {
    display: flex;
    gap: var(--space-4);
    flex-wrap: wrap;
    justify-content: center;
  }

  .onboarding-btn {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-5);
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-lg);
    color: var(--color-text-primary);
    font-size: var(--text-sm);
    font-weight: 500;
    transition: background var(--transition-fast), border-color var(--transition-fast);
    text-decoration: none;
  }

  .onboarding-btn:hover {
    background: var(--color-bg-hover);
    border-color: var(--color-accent-primary);
  }

  .stat-card {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    padding: var(--space-6);
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-xl);
    transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
    text-decoration: none;
    cursor: pointer;
  }

  .stat-card:hover {
    border-color: var(--color-border-default);
    box-shadow: var(--shadow-md);
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
    transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
    cursor: pointer;
    width: 100%;
    text-align: left;
  }

  .goal-row:hover {
    border-color: var(--color-border-default);
    box-shadow: var(--shadow-md);
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
