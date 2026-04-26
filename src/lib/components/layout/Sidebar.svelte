<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import Icon from '@iconify/svelte';
  import { appStore } from '$lib/stores/app.svelte.js';
  import { toastStore } from '$lib/stores/toast.svelte.js';
  import { exportData, importData } from '$lib/utils/data-export.js';
  import Badge from '$lib/components/ui/Badge.svelte';

  let mounted = $state(false);
  onMount(() => { mounted = true; });

  interface NavItem {
    label: string;
    href: string;
    icon: string;
  }

  const navItems: NavItem[] = [
    { label: 'Dashboard', href: '/', icon: 'ph:squares-four' },
    { label: 'Notes', href: '/notes', icon: 'ph:note' },
    { label: 'Tasks', href: '/tasks', icon: 'ph:check-square' },
    { label: 'Goals', href: '/goals', icon: 'ph:target' },
    { label: 'Prompts', href: '/prompts', icon: 'ph:chat-text' },
    { label: 'Stacks', href: '/stacks', icon: 'ph:stack' },
    { label: 'GitHub', href: '/github', icon: 'simple-icons:github' },
    { label: 'Terminal', href: '/terminal', icon: 'ph:terminal-window' },
    { label: 'Vercel', href: '/vercel', icon: 'simple-icons:vercel' },
    { label: 'PNPM', href: '/pnpm', icon: 'simple-icons:pnpm' },
    { label: 'Snippets', href: '/snippets', icon: 'ph:brackets-curly' },
    { label: 'Supabase', href: '/supabase', icon: 'simple-icons:supabase' },
    { label: 'Rust', href: '/rust', icon: 'simple-icons:rust' },
    { label: 'Dev', href: '/dev', icon: 'ph:code' },
  ];

  const counts = $derived([
    0,
    appStore.noteCount,
    appStore.openTaskCount,
    appStore.activeGoalCount,
    appStore.promptCount,
    appStore.stackCount,
    appStore.githubCount,
    appStore.terminalCount,
    appStore.vercelCount,
    appStore.pnpmCount,
    appStore.snippetsCount,
    appStore.supabaseCount,
    appStore.rustCount,
    appStore.devCount,
  ]);

  function isActive(href: string): boolean {
    if (href === '/') return page.url.pathname === '/';
    return page.url.pathname.startsWith(href);
  }

  let fileInputRef = $state<HTMLInputElement | null>(null);

  function toggleSidebar(): void {
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      appStore.mobileSidebarOpen = false;
      return;
    }
    appStore.sidebarCollapsed = !appStore.sidebarCollapsed;
  }

  function handleNavClick(): void {
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      appStore.mobileSidebarOpen = false;
    }
  }

  const isCollapsed = $derived(appStore.sidebarCollapsed && !appStore.mobileSidebarOpen);

  function handleExport(): void {
    exportData();
    toastStore.success('Data exported');
  }

  async function handleImport(): Promise<void> {
    fileInputRef?.click();
  }

  async function handleFileSelect(e: Event): Promise<void> {
    const input = e.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const result = await importData(file);
    if (result.success) {
      toastStore.success('Data imported — reloading...');
      setTimeout(() => window.location.reload(), 1000);
    } else {
      toastStore.error(result.error ?? 'Import failed');
    }
    input.value = '';
  }
</script>

<aside class="sidebar" class:collapsed={isCollapsed}>
  <div class="sidebar-header">
    {#if !isCollapsed}
      <span class="logo-text">Cortex</span>
    {:else}
      <span class="logo-icon">
        <Icon icon="ph:brain" width={22} height={22} />
      </span>
    {/if}
  </div>

  <nav class="sidebar-nav">
    {#each navItems as item, i}
      <a
        href={item.href}
        class="nav-item"
        class:active={isActive(item.href)}
        title={isCollapsed ? item.label : undefined}
        aria-label={item.label}
        aria-current={isActive(item.href) ? 'page' : undefined}
        onclick={handleNavClick}
      >
        <span class="nav-icon">
          <Icon icon={item.icon} width={20} height={20} />
        </span>
        {#if !isCollapsed}
          <span class="nav-label">{item.label}</span>
          {#if (counts[i] ?? 0) > 0}
            <Badge value={counts[i] ?? 0} />
          {/if}
        {/if}
      </a>
    {/each}
  </nav>

  <div class="sidebar-footer">
    {#if !isCollapsed}
      <div class="data-actions">
        <button class="data-btn" onclick={handleExport} title="Export data">
          <Icon icon="ph:download" width={14} height={14} />
          <span>Export</span>
        </button>
        <button class="data-btn" onclick={() => void handleImport()} title="Import data">
          <Icon icon="ph:upload" width={14} height={14} />
          <span>Import</span>
        </button>
      </div>
    {/if}
    <input
      bind:this={fileInputRef}
      id="file-import-input"
      name="file-import-input"
      type="file"
      accept=".json"
      class="file-input-hidden"
      onchange={(e) => void handleFileSelect(e)}
    />
    <button 
      class="collapse-btn" 
      onclick={toggleSidebar} 
      aria-label="Toggle sidebar"
      aria-expanded={!isCollapsed}
    >
      <Icon
        icon={isCollapsed ? 'ph:arrow-right' : 'ph:arrow-left'}
        width={18}
        height={18}
      />
    </button>
  </div>
</aside>

<style>
  .sidebar {
    position: relative;
    height: 100vh;
    width: 100%;
    background:
      linear-gradient(180deg, rgba(18, 26, 38, 0.82), rgba(11, 16, 24, 0.64)),
      var(--color-bg-secondary);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    border-right: var(--glass-border);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    z-index: var(--z-sidebar);
    box-shadow: inset -1px 0 0 rgba(255, 255, 255, 0.025);
  }

  .sidebar-header {
    height: var(--topbar-height);
    display: flex;
    align-items: center;
    padding: 0 var(--space-4);
    border-bottom: 1px solid var(--color-border-subtle);
    flex-shrink: 0;
  }

  .logo-text {
    font-size: var(--text-xl);
    font-weight: var(--weight-bold);
    color: var(--color-accent-primary);
    letter-spacing: var(--tracking-xl);
    line-height: var(--leading-xl);
    white-space: nowrap;
  }

  .logo-icon {
    color: var(--color-accent-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
  }

  .sidebar-nav {
    flex: 1;
    padding: var(--space-3) var(--space-2);
    display: flex;
    flex-direction: column;
    gap: var(--space-0-5);
    overflow-y: auto;
  }

  .nav-item {
    position: relative;
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-md);
    color: var(--color-text-secondary);
    transition:
      background var(--transition-fast),
      color var(--transition-fast),
      transform var(--transition-fast);
    white-space: nowrap;
    min-height: 44px;
    border: 1px solid transparent;
  }

  .nav-item:hover {
    background: var(--color-bg-hover);
    border-color: var(--color-border-subtle);
    color: var(--color-text-primary);
  }

  .nav-item:active {
    transform: scale(0.98);
  }

  .nav-item.active {
    background:
      linear-gradient(135deg, rgba(143, 184, 255, 0.18), rgba(125, 218, 198, 0.08)),
      var(--color-accent-primary-muted);
    border-color: rgba(143, 184, 255, 0.20);
    color: var(--color-accent-primary);
    box-shadow: var(--shadow-xs);
  }

  .nav-item.active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 20px;
    background: var(--color-accent-primary);
    border-radius: 0 var(--radius-full) var(--radius-full) 0;
  }

  .nav-icon {
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  .nav-label {
    flex: 1;
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
    letter-spacing: var(--tracking-sm);
    line-height: var(--leading-sm);
  }

  .sidebar-footer {
    padding: var(--space-3) var(--space-2);
    border-top: 1px solid var(--color-border-subtle);
    flex-shrink: 0;
  }

  .data-actions {
    display: flex;
    gap: var(--space-1);
    padding: 0 var(--space-1);
    margin-bottom: var(--space-2);
  }

  .data-btn {
    display: flex;
    align-items: center;
    gap: var(--space-1-5);
    padding: var(--space-1-5) var(--space-2);
    min-height: 36px;
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    letter-spacing: var(--tracking-xs);
    color: var(--color-text-tertiary);
    border-radius: var(--radius-md);
    transition:
      background var(--transition-fast),
      color var(--transition-fast),
      transform var(--transition-fast);
    flex: 1;
    justify-content: center;
  }

  .data-btn:hover {
    background: var(--color-bg-hover);
    color: var(--color-text-secondary);
  }

  .data-btn:active {
    transform: scale(0.98);
    background: var(--color-bg-active);
  }

  .file-input-hidden {
    position: absolute;
    width: 0;
    height: 0;
    opacity: 0;
    overflow: hidden;
    pointer-events: none;
  }

  .collapse-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-2);
    min-height: 40px;
    border-radius: var(--radius-md);
    color: var(--color-text-tertiary);
    transition:
      background var(--transition-fast),
      color var(--transition-fast),
      transform var(--transition-fast);
  }

  .collapse-btn:hover {
    background: var(--color-bg-hover);
    color: var(--color-text-primary);
  }

  .collapse-btn:active {
    transform: scale(0.98);
    background: var(--color-bg-active);
  }
</style>
