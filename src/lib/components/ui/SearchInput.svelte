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
    left: var(--space-2);
    color: var(--color-text-tertiary);
    display: flex;
    align-items: center;
    pointer-events: none;
  }

  .search-input {
    width: 100%;
    height: 32px;
    padding: 0 var(--space-8) 0 var(--space-7);
    background: var(--color-bg-tertiary);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    color: var(--color-text-primary);
    transition: border-color var(--transition-fast);
  }

  .search-input::placeholder {
    color: var(--color-text-tertiary);
  }

  .search-input:focus {
    outline: none;
    border-color: var(--color-accent-primary);
  }

  .clear-btn {
    position: absolute;
    right: var(--space-2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-tertiary);
    border-radius: var(--radius-sm);
    padding: 2px;
    transition: color var(--transition-fast);
  }

  .clear-btn:hover {
    color: var(--color-text-primary);
  }
</style>
