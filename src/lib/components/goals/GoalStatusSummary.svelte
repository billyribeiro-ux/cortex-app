<script lang="ts">
  import type { GoalStatus } from '$lib/types/index.js';
  import { GOAL_STATUS_CONFIG } from '$lib/types/index.js';
  import { goalsStore } from '$lib/stores/goals.svelte.js';
  import Icon from '@iconify/svelte';

  const statuses = Object.keys(GOAL_STATUS_CONFIG) as GoalStatus[];
</script>

<div class="summary-bar">
  {#each statuses as status}
    {@const cfg = GOAL_STATUS_CONFIG[status]}
    {@const count = goalsStore.goalsByStatus[status]}
    {#if count > 0}
      <button
        class="segment"
        class:active={goalsStore.filter.status === status}
        style:--seg-color={cfg.color}
        onclick={() => goalsStore.setStatusFilter(goalsStore.filter.status === status ? null : status)}
      >
        <Icon icon={cfg.icon} width={12} height={12} />
        <span class="seg-count">{count}</span>
        <span class="seg-label">{cfg.label}</span>
      </button>
    {/if}
  {/each}
</div>

<style>
  .summary-bar {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    flex-wrap: wrap;
  }

  .segment {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1-5);
    padding: var(--space-1) var(--space-3);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-md);
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    color: var(--seg-color);
    min-height: 32px;
    letter-spacing: var(--tracking-xs);
    transition:
      background var(--transition-fast),
      border-color var(--transition-fast),
      transform var(--transition-fast);
    cursor: pointer;
  }

  .segment:hover {
    border-color: var(--seg-color);
    background: color-mix(in srgb, var(--seg-color) 10%, transparent);
  }

  .segment:active {
    transform: scale(0.97);
    background: color-mix(in srgb, var(--seg-color) 18%, transparent);
    transition:
      transform 0.1s var(--ease-out),
      background 0.05s;
  }

  .segment.active {
    border-color: var(--seg-color);
    background: color-mix(in srgb, var(--seg-color) 15%, transparent);
  }

  .seg-count {
    font-weight: var(--weight-bold);
  }

  .seg-label {
    color: var(--color-text-secondary);
    letter-spacing: var(--tracking-xs);
  }
</style>
