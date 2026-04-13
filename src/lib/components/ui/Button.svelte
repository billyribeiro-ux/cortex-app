<script lang="ts">
  import type { Snippet } from 'svelte';

  /**
   * Props for the Button component
   */
  interface Props {
    /** The visual variant of the button */
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    /** The size of the button, affects padding and font size */
    size?: 'sm' | 'md' | 'lg';
    /** The HTML button type */
    type?: 'button' | 'submit' | 'reset';
    /** Whether the button is disabled */
    disabled?: boolean;
    /** Accessible label for screen readers */
    ariaLabel?: string;
    /** Controls attribute for accessibility */
    ariaControls?: string;
    /** Expanded state for accessibility */
    ariaExpanded?: boolean;
    /** Click handler */
    onclick?: (e: MouseEvent) => void;
    /** Button content */
    children?: Snippet;
  }

  let {
    variant = 'primary',
    size = 'md',
    type = 'button',
    disabled = false,
    ariaLabel,
    ariaControls,
    ariaExpanded,
    onclick,
    children,
  }: Props = $props();
</script>

<button
  {type}
  class={['btn', `btn--${variant}`, `btn--${size}`]}
  {disabled}
  aria-label={ariaLabel}
  aria-controls={ariaControls}
  aria-expanded={ariaExpanded}
  onclick={onclick}
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
    padding: var(--space-2) var(--space-4);
    font-size: var(--text-sm);
    min-height: var(--control-height-sm);
  }

  .btn--md {
    padding: var(--space-3) var(--space-5);
    font-size: var(--text-base);
    min-height: var(--control-height-md);
  }

  .btn--lg {
    padding: var(--space-4) var(--space-6);
    font-size: var(--text-lg);
    min-height: var(--control-height-lg);
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

  .btn--secondary {
    background: var(--color-bg-tertiary);
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
    font-weight: var(--weight-semibold);
    box-shadow: var(--shadow-xs);
  }

  .btn--danger:hover:not(:disabled) {
    background: color-mix(in srgb, var(--color-accent-danger) 85%, black);
  }
</style>
