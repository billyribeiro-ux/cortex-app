<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import Icon from '@iconify/svelte';
  import { appStore } from '$lib/stores/app.svelte.js';
  import Badge from '$lib/components/ui/Badge.svelte';

  let mounted = $state(false);
  onMount(() => { mounted = true; });

  interface NavItem {
    label: string;
    href: string;
    icon: string;
    count: number;
  }

  const navItems: NavItem[] = [
    { label: 'Dashboard', href: '/', icon: 'ph:squares-four', count: 0 },
    { label: 'Notes', href: '/notes', icon: 'ph:note', count: appStore.noteCount },
    { label: 'Tasks', href: '/tasks', icon: 'ph:check-square', count: appStore.openTaskCount },
    { label: 'Goals', href: '/goals', icon: 'ph:target', count: appStore.activeGoalCount },
  ];

  const counts = $derived([
    0,
    appStore.noteCount,
    appStore.openTaskCount,
    appStore.activeGoalCount,
  ]);

  function isActive(href: string): boolean {
    if (href === '/') return page.url.pathname === '/';
    return page.url.pathname.startsWith(href);
  }

  function toggleSidebar(): void {
    appStore.sidebarCollapsed = !appStore.sidebarCollapsed;
  }
</script>

<aside class="sidebar" class:collapsed={appStore.sidebarCollapsed} class:transitions-ready={mounted}>
  <div class="sidebar-header">
    {#if !appStore.sidebarCollapsed}
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
        title={appStore.sidebarCollapsed ? item.label : undefined}
      >
        <span class="nav-icon">
          <Icon icon={item.icon} width={20} height={20} />
        </span>
        {#if !appStore.sidebarCollapsed}
          <span class="nav-label">{item.label}</span>
          {#if (counts[i] ?? 0) > 0}
            <Badge value={counts[i] ?? 0} />
          {/if}
        {/if}
      </a>
    {/each}
  </nav>

  <div class="sidebar-footer">
    <button class="collapse-btn" onclick={toggleSidebar} aria-label="Toggle sidebar">
      <Icon
        icon={appStore.sidebarCollapsed ? 'ph:arrow-right' : 'ph:arrow-left'}
        width={18}
        height={18}
      />
    </button>
  </div>
</aside>

<style>
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: var(--sidebar-width);
    background: var(--color-bg-secondary);
    border-right: 1px solid var(--color-border-subtle);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    z-index: 100;
  }

  .sidebar.transitions-ready {
    transition: width var(--transition-normal);
  }

  .sidebar.collapsed {
    width: var(--sidebar-collapsed-width);
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
    font-size: var(--text-lg);
    font-weight: 700;
    color: var(--color-accent-primary);
    letter-spacing: -0.02em;
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
    gap: var(--space-1);
    overflow-y: auto;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-md);
    color: var(--color-text-secondary);
    transition: background var(--transition-fast), color var(--transition-fast);
    white-space: nowrap;
    min-height: 36px;
  }

  .nav-item:hover {
    background: var(--color-bg-hover);
    color: var(--color-text-primary);
  }

  .nav-item.active {
    background: rgba(108, 92, 231, 0.15);
    color: var(--color-accent-primary);
  }

  .nav-icon {
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  .nav-label {
    flex: 1;
    font-size: var(--text-sm);
    font-weight: 500;
  }

  .sidebar-footer {
    padding: var(--space-3) var(--space-2);
    border-top: 1px solid var(--color-border-subtle);
    flex-shrink: 0;
  }

  .collapse-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-2);
    border-radius: var(--radius-md);
    color: var(--color-text-tertiary);
    transition: background var(--transition-fast), color var(--transition-fast);
  }

  .collapse-btn:hover {
    background: var(--color-bg-hover);
    color: var(--color-text-primary);
  }
</style>
