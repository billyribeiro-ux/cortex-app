<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    onclick?: () => void;
    children?: Snippet;
  }

  let {
    variant = 'primary',
    size = 'md',
    disabled = false,
    onclick,
    children,
  }: Props = $props();
</script>

<button
  class={['btn', `btn--${variant}`, `btn--${size}`]}
  {disabled}
  {onclick}
>
  {@render children?.()}
</button>

<style>
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    border-radius: var(--radius-md);
    font-weight: var(--weight-medium);
    letter-spacing: var(--tracking-sm);
    transition: background var(--transition-fast),
                color var(--transition-fast),
                transform var(--transition-fast),
                box-shadow var(--transition-fast),
                opacity var(--transition-fast);
    white-space: nowrap;
  }

  .btn:active:not(:disabled) {
    transform: scale(0.97);
  }

  .btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  /* Sizes */
  .btn--sm {
    padding: var(--space-1-5) var(--space-3);
    font-size: var(--text-xs);
    min-height: 36px;
  }

  .btn--md {
    padding: var(--space-2) var(--space-4);
    font-size: var(--text-sm);
    min-height: 36px;
  }

  .btn--lg {
    padding: var(--space-3) var(--space-6);
    font-size: var(--text-base);
    min-height: 44px;
  }

  /* Variants */
  .btn--primary {
    background: var(--color-accent-primary);
    color: #fff;
    font-weight: var(--weight-semibold);
    box-shadow: var(--shadow-xs);
  }

  .btn--primary:hover:not(:disabled) {
    background: var(--color-accent-primary-hover);
    box-shadow: var(--shadow-sm);
  }

  .btn--primary:focus-visible {
    box-shadow: var(--shadow-glow);
  }

  .btn--secondary {
    background: var(--color-bg-tertiary);
    color: var(--color-text-primary);
    border: 1px solid var(--color-border-default);
  }

  .btn--secondary:hover:not(:disabled) {
    background: var(--color-bg-hover);
  }

  .btn--secondary:focus-visible {
    box-shadow: var(--shadow-glow);
  }

  .btn--ghost {
    background: transparent;
    color: var(--color-text-secondary);
  }

  .btn--ghost:hover:not(:disabled) {
    background: var(--color-bg-hover);
    color: var(--color-text-primary);
  }

  .btn--ghost:focus-visible {
    box-shadow: var(--shadow-glow);
  }

  .btn--danger {
    background: var(--color-accent-danger);
    color: #fff;
    font-weight: var(--weight-semibold);
    box-shadow: var(--shadow-xs);
  }

  .btn--danger:hover:not(:disabled) {
    background: color-mix(in srgb, var(--color-accent-danger) 85%, black);
  }

  .btn--danger:focus-visible {
    box-shadow: var(--shadow-glow-danger);
  }
</style>
