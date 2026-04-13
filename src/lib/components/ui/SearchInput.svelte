<script lang="ts">
  import Icon from '@iconify/svelte';

  /**
   * Props for the SearchInput component
   */
  interface Props {
    /** The search value */
    value: string;
    /** Placeholder text for the input */
    placeholder?: string;
    /** Accessible label for screen readers */
    ariaLabel?: string;
  }

  let { value = $bindable(''), placeholder = 'Search...', ariaLabel }: Props = $props();
  let inputEl: HTMLInputElement;

  /**
   * Clears the search input and focuses it
   */
  function clear(): void {
    value = '';
    inputEl?.focus();
  }
</script>

<div class="search-wrap" role="search">
  <span class="search-icon" aria-hidden="true">
    <Icon icon="ph:magnifying-glass" width={20} height={20} />
  </span>
  <input
    bind:this={inputEl}
    class="search-input selectable"
    type="search"
    {placeholder}
    aria-label={ariaLabel || placeholder}
    bind:value
  />
  {#if value.length > 0}
    <button class="clear-btn" onclick={clear} aria-label="Clear search">
      <Icon icon="ph:x" width={16} height={16} />
    </button>
  {:else}
    <div class="shortcut-hint" aria-hidden="true">
      <kbd>⌘F</kbd>
    </div>
  {/if}
</div>

<style>
  .search-wrap {
    position: relative;
    display: flex;
    align-items: center;
    width: 240px;
  }

  .search-icon {
    position: absolute;
    left: 12px;
    color: var(--color-text-quaternary);
    display: flex;
    align-items: center;
    pointer-events: none;
    transition: color var(--transition-normal);
  }

  .search-wrap:focus-within .search-icon {
    color: var(--color-accent-primary);
  }

  .search-input {
    width: 100%;
    height: var(--control-height-md);
    padding: 0 var(--space-8) 0 40px;
    background: var(--color-bg-tertiary);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-md);
    font-size: var(--text-base);
    font-weight: var(--weight-medium);
    color: var(--color-text-primary);
    letter-spacing: var(--tracking-sm);
    transition: border-color var(--transition-normal),
                box-shadow var(--transition-normal),
                background var(--transition-normal);
  }

  .search-input::placeholder {
    color: var(--color-text-quaternary);
    font-weight: var(--weight-medium);
  }

  .search-input:hover {
    border-color: var(--color-border-default);
  }

  .search-input:focus-visible {
    border-color: var(--color-accent-primary);
    background: var(--color-bg-elevated);
    outline: 2px solid var(--color-accent-primary);
    outline-offset: -1px;
  }

  .clear-btn {
    position: absolute;
    right: var(--space-2);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    color: var(--color-text-quaternary);
    border-radius: var(--radius-xs);
    transition: color var(--transition-fast),
                background var(--transition-fast),
                transform var(--transition-fast);
  }

  .clear-btn:hover {
    background: var(--color-bg-hover);
    color: var(--color-text-secondary);
  }

  .clear-btn:active {
    transform: scale(0.9);
  }

  .shortcut-hint {
    position: absolute;
    right: 12px;
    display: flex;
    align-items: center;
    pointer-events: none;
  }

  .shortcut-hint kbd {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--color-text-tertiary);
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border-subtle);
    border-radius: 4px;
    padding: 2px 6px;
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
  }
</style>
