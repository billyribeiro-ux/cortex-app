<script lang="ts">
  import { appStore } from '$lib/stores/app.svelte.js';
  import Icon from '@iconify/svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { notesStore } from '$lib/stores/notes.svelte.js';
  import { promptsStore } from '$lib/stores/prompts.svelte.js';
  import { tasksStore } from '$lib/stores/tasks.svelte.js';
  import { goalsStore } from '$lib/stores/goals.svelte.js';
  import { stacksStore } from '$lib/stores/stacks.svelte.js';
  import { devStore } from '$lib/stores/dev.svelte.js';
  import { githubStore } from '$lib/stores/github.svelte.js';
  import { terminalStore } from '$lib/stores/terminal.svelte.js';
  import { vercelStore } from '$lib/stores/vercel.svelte.js';
  import { pnpmStore } from '$lib/stores/pnpm.svelte.js';
  import { snippetsStore } from '$lib/stores/snippets.svelte.js';
  import { supabaseStore } from '$lib/stores/supabase.svelte.js';
  import { rustStore } from '$lib/stores/rust.svelte.js';
  import { fade, fly } from 'svelte/transition';
  import { backOut } from 'svelte/easing';

  let isOpen = $state(false);
  let searchQuery = $state('');
  let inputEl = $state<HTMLInputElement | null>(null);

  type CommandSection = 'Current Page' | 'Create' | 'Navigation' | 'Workspace';
  type Command = {
    id: string;
    label: string;
    section: CommandSection;
    icon: string;
    hint?: string;
    action: () => void | Promise<void>;
  };

  const navCommands: Command[] = [
    { id: 'nav-dashboard', section: 'Navigation', label: 'Dashboard', icon: 'ph:squares-four', action: () => goto('/') },
    { id: 'nav-notes', section: 'Navigation', label: 'Notes', icon: 'ph:note', action: () => goto('/notes') },
    { id: 'nav-tasks', section: 'Navigation', label: 'Tasks', icon: 'ph:check-square', action: () => goto('/tasks') },
    { id: 'nav-goals', section: 'Navigation', label: 'Goals', icon: 'ph:target', action: () => goto('/goals') },
    { id: 'nav-prompts', section: 'Navigation', label: 'Prompts', icon: 'ph:chat-text', action: () => goto('/prompts') },
    { id: 'nav-stacks', section: 'Navigation', label: 'Stacks', icon: 'ph:stack', action: () => goto('/stacks') },
    { id: 'nav-github', section: 'Navigation', label: 'GitHub', icon: 'simple-icons:github', action: () => goto('/github') },
    { id: 'nav-terminal', section: 'Navigation', label: 'Terminal', icon: 'ph:terminal-window', action: () => goto('/terminal') },
    { id: 'nav-vercel', section: 'Navigation', label: 'Vercel', icon: 'simple-icons:vercel', action: () => goto('/vercel') },
    { id: 'nav-pnpm', section: 'Navigation', label: 'PNPM', icon: 'simple-icons:pnpm', action: () => goto('/pnpm') },
    { id: 'nav-snippets', section: 'Navigation', label: 'Snippets', icon: 'ph:brackets-curly', action: () => goto('/snippets') },
    { id: 'nav-supabase', section: 'Navigation', label: 'Supabase', icon: 'simple-icons:supabase', action: () => goto('/supabase') },
    { id: 'nav-rust', section: 'Navigation', label: 'Rust', icon: 'simple-icons:rust', action: () => goto('/rust') },
    { id: 'nav-dev', section: 'Navigation', label: 'Dev', icon: 'ph:code', action: () => goto('/dev') },
  ];

  const createCommands: Command[] = [
    { id: 'create-note', section: 'Create', label: 'New Note', icon: 'ph:note-pencil', hint: 'Create in Notes', action: async () => { await goto('/notes'); notesStore.createNote(); } },
    { id: 'create-task', section: 'Create', label: 'New Task', icon: 'ph:check-square', hint: 'Open task modal', action: async () => { await goto('/tasks'); tasksStore.openCreateModal(); } },
    { id: 'create-goal', section: 'Create', label: 'New Goal', icon: 'ph:target', hint: 'Open goal modal', action: async () => { await goto('/goals'); goalsStore.openCreateModal(); } },
    { id: 'create-prompt', section: 'Create', label: 'New Prompt', icon: 'ph:chat-text', hint: 'Create in Prompts', action: async () => { await goto('/prompts'); promptsStore.createPrompt(); } },
    { id: 'create-stack', section: 'Create', label: 'New Stack', icon: 'ph:stack', hint: 'Create in Stacks', action: async () => { await goto('/stacks'); stacksStore.createStack(); } },
    { id: 'create-snippet', section: 'Create', label: 'New Snippet', icon: 'ph:brackets-curly', hint: 'Create in Snippets', action: async () => { await goto('/snippets'); snippetsStore.createSnippet(); } },
  ];

  function currentPageCommands(): Command[] {
    const path = page.url.pathname;
    const commands: Command[] = [];

    if (path.startsWith('/notes') && notesStore.activeNote) {
      commands.push({ id: 'current-back-notes', section: 'Current Page', label: 'Back to Notes List', icon: 'ph:arrow-left', action: () => notesStore.setActiveNote(null) });
    } else if (path.startsWith('/prompts') && promptsStore.activePrompt) {
      commands.push({ id: 'current-back-prompts', section: 'Current Page', label: 'Back to Prompts List', icon: 'ph:arrow-left', action: () => promptsStore.setActivePrompt(null) });
    } else if (path.startsWith('/stacks') && stacksStore.activeStack) {
      commands.push({ id: 'current-back-stacks', section: 'Current Page', label: 'Back to Stacks List', icon: 'ph:arrow-left', action: () => stacksStore.setActiveStack(null) });
    } else if (path.startsWith('/dev') && devStore.activeDev) {
      commands.push({ id: 'current-back-dev', section: 'Current Page', label: 'Back to Dev List', icon: 'ph:arrow-left', action: () => devStore.setActiveDev(null) });
    } else if (path.startsWith('/github') && githubStore.activeGithub) {
      commands.push({ id: 'current-back-github', section: 'Current Page', label: 'Back to GitHub List', icon: 'ph:arrow-left', action: () => githubStore.setActiveGithub(null) });
    } else if (path.startsWith('/terminal') && terminalStore.activeTerminal) {
      commands.push({ id: 'current-back-terminal', section: 'Current Page', label: 'Back to Terminal List', icon: 'ph:arrow-left', action: () => terminalStore.setActiveTerminal(null) });
    } else if (path.startsWith('/vercel') && vercelStore.activeVercel) {
      commands.push({ id: 'current-back-vercel', section: 'Current Page', label: 'Back to Vercel List', icon: 'ph:arrow-left', action: () => vercelStore.setActiveVercel(null) });
    } else if (path.startsWith('/pnpm') && pnpmStore.activePnpm) {
      commands.push({ id: 'current-back-pnpm', section: 'Current Page', label: 'Back to PNPM List', icon: 'ph:arrow-left', action: () => pnpmStore.setActivePnpm(null) });
    } else if (path.startsWith('/snippets') && snippetsStore.activeSnippet) {
      commands.push({ id: 'current-back-snippets', section: 'Current Page', label: 'Back to Snippets List', icon: 'ph:arrow-left', action: () => snippetsStore.setActiveSnippet(null) });
    } else if (path.startsWith('/supabase') && supabaseStore.activeSupabase) {
      commands.push({ id: 'current-back-supabase', section: 'Current Page', label: 'Back to Supabase List', icon: 'ph:arrow-left', action: () => supabaseStore.setActiveSupabase(null) });
    } else if (path.startsWith('/rust') && rustStore.activeRust) {
      commands.push({ id: 'current-back-rust', section: 'Current Page', label: 'Back to Rust List', icon: 'ph:arrow-left', action: () => rustStore.setActiveRust(null) });
    }

    return commands;
  }

  const commands = $derived<Command[]>([
    ...currentPageCommands(),
    ...createCommands,
    ...navCommands,
    {
      id: 'workspace-sidebar',
      section: 'Workspace',
      label: 'Toggle Sidebar',
      icon: 'ph:sidebar',
      hint: appStore.sidebarCollapsed ? 'Expand navigation' : 'Collapse navigation',
      action: () => { appStore.sidebarCollapsed = !appStore.sidebarCollapsed; },
    },
  ]);

  let filteredCommands = $derived(
    searchQuery
      ? commands.filter(cmd => `${cmd.label} ${cmd.section} ${cmd.hint ?? ''}`.toLowerCase().includes(searchQuery.toLowerCase()))
      : commands
  );

  const groupedCommands = $derived.by(() => {
    const groups = new Map<CommandSection, Command[]>();
    for (const cmd of filteredCommands) {
      if (!groups.has(cmd.section)) groups.set(cmd.section, []);
      groups.get(cmd.section)?.push(cmd);
    }
    return [...groups.entries()];
  });

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

  function executeCommand(cmd: Command) {
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
            {#each groupedCommands as [section, group] (section)}
              <li class="command-section">{section}</li>
              {#each group as cmd (cmd.id)}
                {@const i = filteredCommands.findIndex((item) => item.id === cmd.id)}
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
                  <Icon icon={cmd.icon} width={17} height={17} />
                  <span>{cmd.label}</span>
                  {#if cmd.hint}
                    <small>{cmd.hint}</small>
                  {/if}
                </li>
              {/each}
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
    background: rgba(1, 5, 12, 0.46);
    backdrop-filter: blur(12px) saturate(118%);
    z-index: 10000;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding-top: 12vh;
  }

  .palette-dialog {
    width: 100%;
    max-width: 620px;
    background:
      linear-gradient(180deg, rgba(27, 35, 48, 0.94), rgba(11, 16, 23, 0.94)),
      var(--color-bg-elevated);
    border: 1px solid rgba(210, 224, 255, 0.16);
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
    height: 52px;
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
    font-size: var(--text-base);
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
    max-height: 390px;
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

  .command-section {
    padding: var(--space-2) var(--space-3) var(--space-1);
    color: var(--color-text-quaternary);
    font-size: 10px;
    font-weight: var(--weight-bold);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .command-item {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    min-height: 40px;
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-md);
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: background 0.1s, color 0.1s;
  }

  .command-item.selected {
    background: rgba(143, 184, 255, 0.16);
    color: var(--color-text-primary);
    box-shadow: inset 0 0 0 1px rgba(143, 184, 255, 0.18);
  }

  .command-item small {
    margin-left: auto;
    color: var(--color-text-quaternary);
    font-size: var(--text-xs);
  }
</style>
