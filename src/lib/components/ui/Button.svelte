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
    font-weight: 500;
    transition: background var(--transition-fast), color var(--transition-fast), opacity var(--transition-fast);
    white-space: nowrap;
  }

  .btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  /* Sizes */
  .btn--sm {
    padding: var(--space-1) var(--space-3);
    font-size: var(--text-xs);
  }

  .btn--md {
    padding: var(--space-2) var(--space-4);
    font-size: var(--text-sm);
  }

  .btn--lg {
    padding: var(--space-3) var(--space-6);
    font-size: var(--text-base);
  }

  /* Variants */
  .btn--primary {
    background: var(--color-accent-primary);
    color: #fff;
  }

  .btn--primary:hover:not(:disabled) {
    background: var(--color-accent-primary-hover);
  }

  .btn--secondary {
    background: var(--color-bg-elevated);
    color: var(--color-text-primary);
    border: 1px solid var(--color-border-default);
  }

  .btn--secondary:hover:not(:disabled) {
    background: var(--color-bg-hover);
  }

  .btn--ghost {
    background: transparent;
    color: var(--color-text-secondary);
  }

  .btn--ghost:hover:not(:disabled) {
    background: var(--color-bg-hover);
    color: var(--color-text-primary);
  }

  .btn--danger {
    background: var(--color-accent-danger);
    color: #fff;
  }

  .btn--danger:hover:not(:disabled) {
    background: #c0604a;
  }
</style>
