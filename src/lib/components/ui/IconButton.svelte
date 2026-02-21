<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    label: string;
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    disabled?: boolean;
    onclick?: () => void;
    icon?: Snippet;
  }

  let {
    label,
    variant = 'ghost',
    disabled = false,
    onclick,
    icon,
  }: Props = $props();
</script>

<button
  class={['icon-btn', `icon-btn--${variant}`]}
  {disabled}
  {onclick}
  aria-label={label}
  title={label}
>
  {@render icon?.()}
</button>

<style>
  .icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: var(--radius-md);
    transition: background var(--transition-fast), color var(--transition-fast), opacity var(--transition-fast);
    flex-shrink: 0;
  }

  .icon-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .icon-btn--primary {
    background: var(--color-accent-primary);
    color: #fff;
  }

  .icon-btn--primary:hover:not(:disabled) {
    background: var(--color-accent-primary-hover);
  }

  .icon-btn--secondary {
    background: var(--color-bg-elevated);
    color: var(--color-text-primary);
    border: 1px solid var(--color-border-default);
  }

  .icon-btn--secondary:hover:not(:disabled) {
    background: var(--color-bg-hover);
  }

  .icon-btn--ghost {
    background: transparent;
    color: var(--color-text-secondary);
  }

  .icon-btn--ghost:hover:not(:disabled) {
    background: var(--color-bg-hover);
    color: var(--color-text-primary);
  }

  .icon-btn--danger {
    background: var(--color-accent-danger);
    color: #fff;
  }

  .icon-btn--danger:hover:not(:disabled) {
    background: #c0604a;
  }
</style>
