<script lang="ts">
  import { appStore } from '$lib/stores/app.svelte.js';
  import { onMount } from 'svelte';
  import Icon from '@iconify/svelte';
  import { goto } from '$app/navigation';
  import { fade, fly } from 'svelte/transition';
  import { backOut } from 'svelte/easing';

  let isOpen = $state(false);
  let searchQuery = $state('');
  let inputEl = $state<HTMLInputElement | null>(null);

  const commands = [
    { label: 'Go to Dashboard', icon: 'ph:squares-four', action: () => goto('/') },
    { label: 'Go to Notes', icon: 'ph:note', action: () => goto('/notes') },
    { label: 'Go to Tasks', icon: 'ph:check-square', action: () => goto('/tasks') },
    { label: 'Go to Goals', icon: 'ph:target', action: () => goto('/goals') },
    { label: 'Go to Prompts', icon: 'ph:chat-text', action: () => goto('/prompts') },
    { label: 'Go to Stacks', icon: 'ph:stack', action: () => goto('/stacks') },
    { label: 'Go to GitHub', icon: 'simple-icons:github', action: () => goto('/github') },
    { label: 'Go to Terminal', icon: 'ph:terminal-window', action: () => goto('/terminal') },
    { label: 'Go to Vercel', icon: 'simple-icons:vercel', action: () => goto('/vercel') },
    { label: 'Go to PNPM', icon: 'simple-icons:pnpm', action: () => goto('/pnpm') },
    { label: 'Go to Snippets', icon: 'ph:brackets-curly', action: () => goto('/snippets') },
    { label: 'Go to Supabase', icon: 'simple-icons:supabase', action: () => goto('/supabase') },
    { label: 'Go to Rust', icon: 'simple-icons:rust', action: () => goto('/rust') },
    { label: 'Go to Dev', icon: 'ph:code', action: () => goto('/dev') },
    { label: 'Toggle Sidebar', icon: 'ph:sidebar', action: () => { appStore.sidebarCollapsed = !appStore.sidebarCollapsed; } },
  ];

  let filteredCommands = $derived(
    searchQuery
      ? commands.filter(cmd => cmd.label.toLowerCase().includes(searchQuery.toLowerCase()))
      : commands
  );

  let selectedIndex = $state(0);

  function handleInput() {
    selectedIndex = 0;
  }

  function handleKeydown(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      isOpen = !isOpen;
      if (isOpen) {
        searchQuery = '';
        selectedIndex = 0;
        setTimeout(() => inputEl?.focus(), 50);
      }
    } else if (isOpen) {
      if (e.key === 'Escape') {
        isOpen = false;
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (filteredCommands.length === 0) return;
        selectedIndex = (selectedIndex + 1) % filteredCommands.length;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (filteredCommands.length === 0) return;
        selectedIndex = (selectedIndex - 1 + filteredCommands.length) % filteredCommands.length;
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const cmd = filteredCommands[selectedIndex];
        if (cmd) {
          cmd.action();
          isOpen = false;
        }
      }
    }
  }

  function executeCommand(cmd: typeof commands[0]) {
    cmd.action();
    isOpen = false;
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
  <div class="palette-overlay" transition:fade={{ duration: 150 }} onclick={() => isOpen = false} role="presentation">
    <div 
      class="palette-dialog" 
      role="dialog" 
      aria-label="Command Palette"
      tabindex="-1"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
      transition:fly={{ y: -10, duration: 200, easing: backOut }}
    >
      <div class="palette-header">
        <Icon icon="ph:magnifying-glass" width={20} height={20} class="search-icon" />
        <input
          bind:this={inputEl}
          id="command-palette-input"
          name="command-palette-input"
          type="text"
          class="palette-input"
          placeholder="Type a command or search..."
          bind:value={searchQuery}
          oninput={handleInput}
          aria-label="Command search"
        />
        <kbd class="esc-hint">ESC</kbd>
      </div>

      <div class="palette-body">
        {#if filteredCommands.length === 0}
          <div class="no-results">No commands found.</div>
        {:else}
          <ul class="command-list" role="listbox">
            {#each filteredCommands as cmd, i (cmd.label)}
              <li 
                class="command-item" 
                class:selected={i === selectedIndex}
                onmouseenter={() => selectedIndex = i}
                onclick={() => executeCommand(cmd)}
                onkeydown={(e) => e.key === 'Enter' && executeCommand(cmd)}
                role="option"
                tabindex="-1"
                aria-selected={i === selectedIndex}
              >
                <Icon icon={cmd.icon} width={18} height={18} />
                <span>{cmd.label}</span>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .palette-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    z-index: 10000;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding-top: 12vh;
  }

  .palette-dialog {
    width: 100%;
    max-width: 600px;
    background: var(--color-bg-elevated);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-xl);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .palette-header {
    display: flex;
    align-items: center;
    padding: 0 var(--space-4);
    border-bottom: 1px solid var(--color-border-subtle);
    height: 56px;
  }

  :global(.search-icon) {
    color: var(--color-text-tertiary);
    margin-right: var(--space-3);
  }

  .palette-input {
    flex: 1;
    height: 100%;
    background: transparent;
    border: none;
    color: var(--color-text-primary);
    font-size: var(--text-lg);
    outline: none;
  }

  .palette-input::placeholder {
    color: var(--color-text-quaternary);
  }

  .esc-hint {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--color-text-tertiary);
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border-subtle);
    border-radius: 4px;
    padding: 2px 6px;
  }

  .palette-body {
    max-height: 340px;
    overflow-y: auto;
    padding: var(--space-2);
  }

  .no-results {
    padding: var(--space-6) var(--space-4);
    text-align: center;
    color: var(--color-text-tertiary);
    font-size: var(--text-sm);
  }

  .command-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .command-item {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-md);
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: background 0.1s, color 0.1s;
  }

  .command-item.selected {
    background: var(--color-accent-primary);
    color: #fff;
  }
</style>
