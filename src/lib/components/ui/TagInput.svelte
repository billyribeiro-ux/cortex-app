<script lang="ts">
  import Icon from '@iconify/svelte';

  interface Props {
    tags: string[];
    onAdd: (tag: string) => void;
    onRemove: (tag: string) => void;
  }

  let { tags, onAdd, onRemove }: Props = $props();

  let inputValue = $state('');
  let inputEl = $state<HTMLInputElement | null>(null);

  function addTag(): void {
    const tag = inputValue.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      onAdd(tag);
    }
    inputValue = '';
  }

  function handleKeydown(e: KeyboardEvent): void {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      const lastTag = tags[tags.length - 1];
      if (lastTag !== undefined) onRemove(lastTag);
    }
  }
</script>

<div class="tag-input-wrap" onclick={() => inputEl?.focus()} role="presentation">
  {#each tags as tag}
    <span class="tag-chip">
      {tag}
      <button
        class="tag-remove"
        onclick={(e) => { e.stopPropagation(); onRemove(tag); }}
        aria-label="Remove tag {tag}"
      >
        <Icon icon="ph:x" width={10} height={10} />
      </button>
    </span>
  {/each}
  <input
    bind:this={inputEl}
    class="tag-text-input selectable"
    type="text"
    placeholder="Add tags..."
    bind:value={inputValue}
    onkeydown={handleKeydown}
    onblur={() => { if (inputValue.trim()) addTag(); }}
  />
</div>

<style>
  .tag-input-wrap {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-1);
    padding: var(--space-1) var(--space-2);
    background: var(--color-bg-tertiary);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-md);
    min-height: 36px;
    cursor: text;
    transition: border-color var(--transition-fast),
                box-shadow var(--transition-fast);
  }

  .tag-input-wrap:focus-within {
    border-color: var(--color-accent-primary);
    box-shadow: var(--shadow-glow);
  }

  .tag-chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px var(--space-2);
    background: var(--color-accent-primary-muted);
    color: var(--color-accent-primary);
    border-radius: var(--radius-xs);
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
  }

  .tag-remove {
    display: flex;
    align-items: center;
    color: inherit;
    opacity: 0.7;
    transition: opacity var(--transition-fast);
  }

  .tag-remove:hover {
    opacity: 1;
  }

  .tag-text-input {
    flex: 1;
    min-width: 80px;
    height: 22px;
    font-size: var(--text-xs);
    color: var(--color-text-primary);
    background: transparent;
    border: none;
    outline: none;
  }

  .tag-text-input::placeholder {
    color: var(--color-text-tertiary);
  }
</style>
