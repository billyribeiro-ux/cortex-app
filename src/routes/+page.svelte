<script lang="ts">
  import { goto } from '$app/navigation';
  import { appStore } from '$lib/stores/app.svelte.js';
  import { tasksStore } from '$lib/stores/tasks.svelte.js';
  import { goalsStore } from '$lib/stores/goals.svelte.js';
  import { notesStore } from '$lib/stores/notes.svelte.js';
  import { promptsStore } from '$lib/stores/prompts.svelte.js';
  import { stacksStore } from '$lib/stores/stacks.svelte.js';
  import { githubStore } from '$lib/stores/github.svelte.js';
  import { terminalStore } from '$lib/stores/terminal.svelte.js';
  import { vercelStore } from '$lib/stores/vercel.svelte.js';
  import { pnpmStore } from '$lib/stores/pnpm.svelte.js';
  import { claudeCodeStore } from '$lib/stores/claude-code.svelte.js';
  import { supabaseStore } from '$lib/stores/supabase.svelte.js';
  import { rustStore } from '$lib/stores/rust.svelte.js';
  import ProgressBar from '$lib/components/ui/ProgressBar.svelte';
  import Icon from '@iconify/svelte';

  const isEmpty = $derived(
    appStore.notes.length === 0 &&
    appStore.tasks.length === 0 &&
    appStore.goals.length === 0 &&
    appStore.prompts.length === 0 &&
    appStore.stacks.length === 0 &&
    appStore.github.length === 0 &&
    appStore.terminal.length === 0 &&
    appStore.vercel.length === 0 &&
    appStore.pnpm.length === 0 &&
    appStore.claudeCode.length === 0 &&
    appStore.supabase.length === 0 &&
    appStore.rust.length === 0
  );

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
        <a href="/prompts" class="onboarding-btn" onclick={() => { promptsStore.createPrompt(); }}>
          <Icon icon="ph:chat-text" width={20} height={20} />
          Create a Prompt
        </a>
        <a href="/stacks" class="onboarding-btn" onclick={() => { stacksStore.createStack(); }}>
          <Icon icon="ph:stack" width={20} height={20} />
          Create a Stack
        </a>
        <a href="/github" class="onboarding-btn" onclick={() => { githubStore.createGithub(); }}>
          <Icon icon="simple-icons:github" width={20} height={20} />
          Add a GitHub Item
        </a>
        <a href="/terminal" class="onboarding-btn" onclick={() => { terminalStore.createTerminal(); }}>
          <Icon icon="ph:terminal-window" width={20} height={20} />
          Add a Terminal Item
        </a>
        <a href="/vercel" class="onboarding-btn" onclick={() => { vercelStore.createVercel(); }}>
          <Icon icon="simple-icons:vercel" width={20} height={20} />
          Add a Vercel Item
        </a>
        <a href="/pnpm" class="onboarding-btn" onclick={() => { pnpmStore.createPnpm(); }}>
          <Icon icon="simple-icons:pnpm" width={20} height={20} />
          Add a PNPM Item
        </a>
        <a href="/claude-code" class="onboarding-btn" onclick={() => { claudeCodeStore.createClaudeCode(); }}>
          <Icon icon="simple-icons:anthropic" width={20} height={20} />
          Add a Claude Code Item
        </a>
        <a href="/supabase" class="onboarding-btn" onclick={() => { supabaseStore.createSupabase(); }}>
          <Icon icon="simple-icons:supabase" width={20} height={20} />
          Add a Supabase Item
        </a>
        <a href="/rust" class="onboarding-btn" onclick={() => { rustStore.createRust(); }}>
          <Icon icon="simple-icons:rust" width={20} height={20} />
          Add a Rust Item
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
      <a href="/prompts" class="stat-card">
        <span class="stat-value">{appStore.promptCount}</span>
        <span class="stat-label">Prompts</span>
      </a>
      <a href="/stacks" class="stat-card">
        <span class="stat-value">{appStore.stackCount}</span>
        <span class="stat-label">Stacks</span>
      </a>
      <a href="/github" class="stat-card">
        <span class="stat-value">{appStore.githubCount}</span>
        <span class="stat-label">GitHub</span>
      </a>
      <a href="/terminal" class="stat-card">
        <span class="stat-value">{appStore.terminalCount}</span>
        <span class="stat-label">Terminal</span>
      </a>
      <a href="/vercel" class="stat-card">
        <span class="stat-value">{appStore.vercelCount}</span>
        <span class="stat-label">Vercel</span>
      </a>
      <a href="/pnpm" class="stat-card">
        <span class="stat-value">{appStore.pnpmCount}</span>
        <span class="stat-label">PNPM</span>
      </a>
      <a href="/claude-code" class="stat-card">
        <span class="stat-value">{appStore.claudeCodeCount}</span>
        <span class="stat-label">Claude Code</span>
      </a>
      <a href="/supabase" class="stat-card">
        <span class="stat-value">{appStore.supabaseCount}</span>
        <span class="stat-label">Supabase</span>
      </a>
      <a href="/rust" class="stat-card">
        <span class="stat-value">{appStore.rustCount}</span>
        <span class="stat-label">Rust</span>
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
  /* ═══════════════════════════════════════════════════════════
     Dashboard — Apple Principal Engineer quality
     Token-driven, layered shadows, purposeful motion
     ═══════════════════════════════════════════════════════════ */

  .dashboard {
    display: flex;
    flex-direction: column;
    gap: var(--space-10);
    padding-bottom: var(--space-16);
  }

  .dashboard-title {
    font-size: var(--text-3xl);
    font-weight: var(--weight-bold);
    color: var(--color-text-primary);
    letter-spacing: var(--tracking-3xl);
    line-height: var(--leading-3xl);
  }

  /* ── Stats Grid ── */

  .stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-4);
  }

  .stat-card {
    display: flex;
    flex-direction: column;
    gap: var(--space-1-5);
    padding: var(--space-6);
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-sm);
    text-decoration: none;
    cursor: pointer;
    transition:
      border-color var(--transition-normal),
      box-shadow var(--transition-normal),
      transform var(--transition-normal),
      background var(--transition-normal);
  }

  .stat-card:hover {
    border-color: var(--color-border-default);
    box-shadow: var(--shadow-md);
    transform: translateY(-1px);
    background: var(--color-bg-tertiary);
  }

  .stat-card:active {
    transform: scale(0.98);
    box-shadow: var(--shadow-xs);
    transition-duration: var(--duration-fast);
  }

  .stat-card.danger {
    border-color: var(--color-accent-danger-muted);
    background: color-mix(in srgb, var(--color-accent-danger) 3%, var(--color-bg-secondary));
  }

  .stat-card.danger:hover {
    border-color: color-mix(in srgb, var(--color-accent-danger) 30%, transparent);
  }

  .stat-value {
    font-size: var(--text-2xl);
    font-weight: var(--weight-bold);
    color: var(--color-accent-primary);
    letter-spacing: var(--tracking-2xl);
    line-height: var(--leading-2xl);
    font-variant-numeric: tabular-nums;
  }

  .stat-value.overdue {
    color: var(--color-accent-danger);
  }

  .stat-label {
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    color: var(--color-text-tertiary);
    letter-spacing: var(--tracking-xs);
    line-height: var(--leading-xs);
    text-transform: uppercase;
  }

  .stat-breakdown {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    margin-top: var(--space-1);
    font-size: var(--text-xs);
    font-weight: var(--weight-normal);
    color: var(--color-text-quaternary);
    letter-spacing: var(--tracking-xs);
    line-height: var(--leading-xs);
    flex-wrap: wrap;
  }

  /* ── Onboarding ── */

  .onboarding {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-8);
    padding: var(--space-16) var(--space-6);
    background: var(--color-bg-tertiary);
    border: 1.5px dashed var(--color-border-default);
    border-radius: var(--radius-xl);
    text-align: center;
  }

  .onboarding-text {
    font-size: var(--text-sm);
    line-height: var(--leading-sm);
    color: var(--color-text-secondary);
    letter-spacing: var(--tracking-sm);
    max-width: 32ch;
  }

  .onboarding-actions {
    display: flex;
    gap: var(--space-3);
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
    box-shadow: var(--shadow-xs);
    color: var(--color-text-primary);
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
    letter-spacing: var(--tracking-sm);
    line-height: var(--leading-sm);
    text-decoration: none;
    transition:
      background var(--transition-normal),
      border-color var(--transition-normal),
      box-shadow var(--transition-normal),
      transform var(--transition-normal);
  }

  .onboarding-btn:hover {
    background: var(--color-bg-hover);
    border-color: var(--color-accent-primary);
    box-shadow: var(--shadow-sm), var(--shadow-glow);
  }

  .onboarding-btn:active {
    transform: scale(0.98);
    box-shadow: var(--shadow-xs);
    transition-duration: var(--duration-fast);
  }

  /* ── Goals Section ── */

  .goals-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .section-title {
    font-size: var(--text-lg);
    font-weight: var(--weight-semibold);
    color: var(--color-text-primary);
    letter-spacing: var(--tracking-lg);
    line-height: var(--leading-lg);
  }

  .goals-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .goal-row {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    min-height: 44px;
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-md);
    cursor: pointer;
    width: 100%;
    text-align: left;
    transition:
      border-color var(--transition-normal),
      box-shadow var(--transition-normal),
      background var(--transition-normal),
      transform var(--transition-normal);
  }

  .goal-row:hover {
    border-color: var(--color-border-default);
    box-shadow: var(--shadow-sm);
    background: var(--color-bg-tertiary);
  }

  .goal-row:active {
    transform: scale(0.98);
    box-shadow: none;
    transition-duration: var(--duration-fast);
  }

  .goal-color-dot {
    width: 10px;
    height: 10px;
    border-radius: var(--radius-full);
    flex-shrink: 0;
  }

  .goal-row-info {
    display: flex;
    flex-direction: column;
    gap: var(--space-0-5);
    min-width: 160px;
    flex-shrink: 0;
  }

  .goal-row-title {
    font-size: var(--text-sm);
    font-weight: var(--weight-semibold);
    color: var(--color-text-primary);
    letter-spacing: var(--tracking-sm);
    line-height: var(--leading-sm);
  }

  .goal-row-date {
    font-size: var(--text-xs);
    font-weight: var(--weight-normal);
    color: var(--color-text-tertiary);
    letter-spacing: var(--tracking-xs);
    line-height: var(--leading-xs);
  }

  .goal-row-progress {
    flex: 1;
    min-width: 0;
  }

  .nearest-deadline {
    font-size: var(--text-sm);
    line-height: var(--leading-sm);
    letter-spacing: var(--tracking-sm);
    color: var(--color-text-tertiary);
    padding-top: var(--space-1);
  }

  .nearest-deadline strong {
    color: var(--color-text-primary);
    font-weight: var(--weight-semibold);
  }
</style>
