<script lang="ts">
  import type { Goal, Milestone } from '$lib/types/index.js';

  interface Props {
    goal: Goal;
  }

  let { goal }: Props = $props();

  const hasTimeline = $derived(
    goal.targetDate !== null &&
    goal.startDate !== goal.targetDate
  );

  const startMs = $derived(new Date(goal.startDate).getTime());
  const endMs = $derived(goal.targetDate ? new Date(goal.targetDate).getTime() : 0);
  const nowMs = $derived(Date.now());
  const totalSpan = $derived(endMs - startMs);

  const elapsedPct = $derived(
    hasTimeline && totalSpan > 0
      ? Math.min(100, Math.max(0, ((nowMs - startMs) / totalSpan) * 100))
      : 0
  );

  const todayPct = $derived(
    hasTimeline && totalSpan > 0
      ? Math.min(100, Math.max(0, ((nowMs - startMs) / totalSpan) * 100))
      : 0
  );

  const isOverdue = $derived(goal.targetDate !== null && nowMs > endMs);

  function getMilestonePct(ms: Milestone): number {
    if (!hasTimeline || totalSpan <= 0 || !ms.targetDate) return -1;
    const msMs = new Date(ms.targetDate).getTime();
    return Math.min(100, Math.max(0, ((msMs - startMs) / totalSpan) * 100));
  }

  const milestonesWithPos = $derived(
    goal.milestones
      .filter((m) => m.targetDate !== null)
      .map((m) => ({ ...m, pct: getMilestonePct(m) }))
      .filter((m) => m.pct >= 0)
  );

  const startLabel = $derived(
    new Date(goal.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  );
  const endLabel = $derived(
    goal.targetDate
      ? new Date(goal.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : ''
  );
</script>

{#if !hasTimeline}
  <div class="no-timeline">
    <p>No target date set. Add a target date to see the timeline.</p>
  </div>
{:else}
  <div class="timeline-wrap">
    <div class="timeline-bar-container">
      <!-- Background track -->
      <div class="track">
        <!-- Elapsed fill -->
        <div
          class="elapsed-fill"
          class:overdue={isOverdue}
          style:width="{elapsedPct}%"
          style:background={goal.color}
        ></div>
      </div>

      <!-- Today marker -->
      {#if todayPct > 0 && todayPct < 100}
        <div class="today-marker" style:left="{todayPct}%">
          <div class="today-line"></div>
          <span class="today-label">Today</span>
        </div>
      {/if}

      <!-- Milestone markers -->
      {#each milestonesWithPos as ms}
        <div class="milestone-marker" style:left="{ms.pct}%" title="{ms.title}">
          <div
            class="milestone-dot"
            class:completed={ms.isCompleted}
            class:overdue={!ms.isCompleted && ms.targetDate !== null && new Date(ms.targetDate).getTime() < nowMs}
            style:border-color={ms.isCompleted ? 'var(--color-accent-success)' : goal.color}
            style:background={ms.isCompleted ? 'var(--color-accent-success)' : 'var(--color-bg-secondary)'}
          ></div>
          <span class="milestone-tooltip">{ms.title}</span>
        </div>
      {/each}
    </div>

    <div class="timeline-labels">
      <span class="label-start">{startLabel}</span>
      {#if isOverdue}
        <span class="overdue-label">Overdue</span>
      {/if}
      <span class="label-end">{endLabel}</span>
    </div>
  </div>
{/if}

<style>
  .no-timeline {
    padding: var(--space-4);
    color: var(--color-text-tertiary);
    font-size: var(--text-xs);
    text-align: center;
    background: var(--color-bg-tertiary);
    border-radius: var(--radius-md);
    letter-spacing: var(--tracking-xs);
  }

  .timeline-wrap {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .timeline-bar-container {
    position: relative;
    height: 24px;
    display: flex;
    align-items: center;
  }

  .track {
    width: 100%;
    height: 8px;
    background: var(--color-bg-tertiary);
    border-radius: var(--radius-full);
    overflow: hidden;
    position: relative;
  }

  .elapsed-fill {
    height: 100%;
    border-radius: var(--radius-full);
    transition: width 0.4s var(--ease-out);
    opacity: 0.85;
  }

  .elapsed-fill.overdue {
    background: var(--color-accent-danger);
  }

  .today-marker {
    position: absolute;
    top: 0;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    pointer-events: none;
  }

  .today-line {
    width: 1px;
    height: 24px;
    background: var(--color-text-primary);
    opacity: 0.4;
  }

  .today-label {
    font-size: var(--text-xs);
    color: var(--color-text-quaternary);
    white-space: nowrap;
    margin-top: 2px;
    letter-spacing: var(--tracking-xs);
    text-transform: uppercase;
    font-weight: var(--weight-medium);
  }

  .milestone-marker {
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    cursor: pointer;
  }

  .milestone-marker:hover .milestone-tooltip {
    display: block;
  }

  .milestone-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 2px solid;
    transition: transform var(--transition-fast);
    box-shadow: var(--shadow-xs);
  }

  .milestone-dot:hover {
    transform: scale(1.3);
  }

  .milestone-dot.overdue {
    border-color: var(--color-accent-danger);
  }

  .milestone-tooltip {
    display: none;
    position: absolute;
    bottom: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
    background: var(--color-bg-elevated);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-md);
    padding: var(--space-1-5) var(--space-3);
    font-size: var(--text-xs);
    color: var(--color-text-primary);
    white-space: nowrap;
    box-shadow: var(--shadow-md);
    z-index: 10;
    letter-spacing: var(--tracking-xs);
  }

  .timeline-labels {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: var(--text-xs);
    color: var(--color-text-tertiary);
    letter-spacing: var(--tracking-xs);
  }

  .overdue-label {
    font-size: var(--text-xs);
    color: var(--color-accent-danger);
    font-weight: var(--weight-semibold);
    letter-spacing: var(--tracking-xs);
  }
</style>
