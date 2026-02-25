<script lang="ts">
  interface Props {
    progress: number;
    color?: string;
    height?: number;
    showLabel?: boolean;
  }

  let { progress, color = 'var(--color-accent-primary)', height = 6, showLabel = false }: Props = $props();

  const clamped = $derived(Math.min(100, Math.max(0, progress)));
</script>

<div class="progress-bar-wrap">
  <div class="track" style:height="{height}px">
    <div class="fill" style:width="{clamped}%" style:background={color}></div>
  </div>
  {#if showLabel}
    <span class="label">{Math.round(clamped)}%</span>
  {/if}
</div>

<style>
  .progress-bar-wrap {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    width: 100%;
  }

  .track {
    flex: 1;
    background: var(--color-bg-tertiary);
    border-radius: var(--radius-full);
    overflow: hidden;
  }

  .fill {
    height: 100%;
    border-radius: var(--radius-full);
    transition: width 0.4s var(--ease-out);
  }

  .label {
    font-size: var(--text-xs);
    color: var(--color-text-tertiary);
    font-weight: var(--weight-medium);
    letter-spacing: var(--tracking-xs);
    white-space: nowrap;
    min-width: 32px;
    text-align: right;
  }
</style>
