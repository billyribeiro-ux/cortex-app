<script lang="ts">
  import Icon from '@iconify/svelte';

  interface Props {
    value: string;
    placeholder?: string;
  }

  let { value = $bindable(''), placeholder = 'Search...' }: Props = $props();

  function clear(): void {
    value = '';
  }
</script>

<div class="search-wrap">
  <span class="search-icon">
    <Icon icon="ph:magnifying-glass" width={16} height={16} />
  </span>
  <input
    class="search-input selectable"
    type="text"
    {placeholder}
    bind:value
  />
  {#if value.length > 0}
    <button class="clear-btn" onclick={clear} aria-label="Clear search">
      <Icon icon="ph:x" width={14} height={14} />
    </button>
  {/if}
</div>

<style>
  .search-wrap {
    position: relative;
    display: flex;
    align-items: center;
    width: 220px;
  }

  .search-icon {
    position: absolute;
    left: 10px;
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
    padding: 0 var(--space-8) 0 30px;
    background: var(--color-bg-tertiary);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-md);
    font-size: var(--text-xs);
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

  .search-input:focus {
    outline: none;
    border-color: var(--color-accent-primary);
    box-shadow: var(--shadow-glow);
    background: var(--color-bg-elevated);
  }

  .clear-btn {
    position: absolute;
    right: var(--space-2);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
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
</style>
