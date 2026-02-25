<script lang="ts">
  import type { TaskPriority } from '$lib/types/index.js';
  import { TASK_PRIORITY_CONFIG } from '$lib/types/index.js';
  import Icon from '@iconify/svelte';

  interface Props {
    value: TaskPriority;
    onchange: (priority: TaskPriority) => void;
  }

  let { value, onchange }: Props = $props();
  let open = $state(false);
  let wrapEl = $state<HTMLDivElement | null>(null);

  const current = $derived(TASK_PRIORITY_CONFIG[value]);

  function select(p: TaskPriority): void {
    onchange(p);
    open = false;
  }

  function handleOutsideClick(e: MouseEvent): void {
    if (wrapEl && !wrapEl.contains(e.target as Node)) open = false;
  }
</script>

<svelte:window onclick={handleOutsideClick} />

<div class="priority-wrap" bind:this={wrapEl}>
  <button
    class="trigger"
    style:color={current.color}
    onclick={(e) => { e.stopPropagation(); open = !open; }}
    aria-label="Priority: {current.label}"
    title={current.label}
  >
    <Icon icon={current.icon} width={14} height={14} />
  </button>

  {#if open}
    <div class="dropdown">
      {#each Object.entries(TASK_PRIORITY_CONFIG) as [key, cfg]}
        <button
          class="option"
          class:active={value === key}
          style:color={cfg.color}
          onclick={(e) => { e.stopPropagation(); select(key as TaskPriority); }}
        >
          <Icon icon={cfg.icon} width={14} height={14} />
          <span>{cfg.label}</span>
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .priority-wrap {
    position: relative;
    display: inline-flex;
  }

  .trigger {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: var(--radius-sm);
    transition: background var(--transition-fast),
                transform var(--transition-fast);
  }

  .trigger:hover {
    background: var(--color-bg-hover);
  }

  .trigger:active {
    transform: scale(0.92);
  }

  .dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    background: var(--color-bg-elevated);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    z-index: 200;
    min-width: 130px;
    padding: var(--space-1-5);
    animation: dropdown-in var(--transition-spring);
  }

  @keyframes dropdown-in {
    from { opacity: 0; transform: translateY(-4px) scale(0.96); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  .option {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    width: 100%;
    padding: var(--space-2) var(--space-3);
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    border-radius: var(--radius-sm);
    min-height: 32px;
    transition: background var(--transition-fast);
  }

  .option:hover, .option.active {
    background: var(--color-bg-hover);
  }
</style>
