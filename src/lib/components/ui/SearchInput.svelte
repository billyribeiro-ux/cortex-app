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

  function handleKeydown(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
      e.preventDefault();
      inputEl?.focus();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="search-wrap" role="search">
  <span class="search-icon" aria-hidden="true">
    <Icon icon="ph:magnifying-glass" width={20} height={20} />
  </span>
  <input
    bind:this={inputEl}
    id="global-search-input"
    name="global-search-input"
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
    width: 188px;
    max-width: 100%;
    transition: width var(--transition-normal);
  }

  @media (min-width: 768px) {
    .search-wrap:focus-within {
      width: 248px;
    }
  }

  @media (max-width: 560px) {
    .search-wrap {
      width: min(44vw, 176px);
    }

    .search-input {
      height: 34px;
      font-size: var(--text-sm);
    }
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
    height: 36px;
    padding: 0 var(--space-7) 0 34px;
    background: rgba(13, 19, 28, 0.58);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
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
    background: rgba(22, 30, 42, 0.82);
    outline: 2px solid rgba(143, 184, 255, 0.24);
    outline-offset: -1px;
  }

  .clear-btn {
    position: absolute;
    right: var(--space-2);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
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
    right: 8px;
    display: flex;
    align-items: center;
    pointer-events: none;
  }

  .shortcut-hint kbd {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--color-text-tertiary);
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border-subtle);
    border-radius: 4px;
    padding: 1px 5px;
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
  }
</style>
