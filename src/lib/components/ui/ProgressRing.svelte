<script lang="ts">
  interface Props {
    progress: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
    showLabel?: boolean;
  }

  let { progress, size = 64, strokeWidth = 4, color = 'var(--color-accent-primary)', showLabel = true }: Props = $props();

  const radius = $derived((size - strokeWidth) / 2);
  const circumference = $derived(2 * Math.PI * radius);
  const offset = $derived(circumference - (Math.min(100, Math.max(0, progress)) / 100) * circumference);
  const center = $derived(size / 2);
  const fontSize = $derived(Math.max(10, Math.round(size * 0.22)));
</script>

<svg width={size} height={size} viewBox="0 0 {size} {size}" class="progress-ring">
  <circle
    class="track"
    cx={center}
    cy={center}
    r={radius}
    fill="none"
    stroke="var(--color-border-subtle)"
    stroke-width={strokeWidth}
  />
  <circle
    class="fill"
    cx={center}
    cy={center}
    r={radius}
    fill="none"
    stroke={color}
    stroke-width={strokeWidth}
    stroke-linecap="round"
    stroke-dasharray={circumference}
    stroke-dashoffset={offset}
    transform="rotate(-90 {center} {center})"
  />
  {#if showLabel}
    <text
      x={center}
      y={center}
      text-anchor="middle"
      dominant-baseline="central"
      font-size={fontSize}
      font-weight="700"
      fill="var(--color-text-primary)"
      font-family="inherit"
    >{Math.round(progress)}%</text>
  {/if}
</svg>

<style>
  .progress-ring {
    flex-shrink: 0;
  }

  .fill {
    transition: stroke-dashoffset 0.5s var(--ease-out);
  }
</style>
