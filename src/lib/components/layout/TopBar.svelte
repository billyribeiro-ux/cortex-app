<script lang="ts">
  import { page } from '$app/state';
  import { appStore } from '$lib/stores/app.svelte.js';
  import SearchInput from '$lib/components/ui/SearchInput.svelte';
  import Icon from '@iconify/svelte';

  const viewTitle = $derived((): string => {
    const path = page.url.pathname;
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/notes')) return 'Notes';
    if (path.startsWith('/tasks')) return 'Tasks';
    if (path.startsWith('/goals')) return 'Goals';
    if (path.startsWith('/prompts')) return 'Prompts';
    if (path.startsWith('/stacks')) return 'Stacks';
    if (path.startsWith('/github')) return 'GitHub';
    if (path.startsWith('/terminal')) return 'Terminal';
    if (path.startsWith('/vercel')) return 'Vercel';
    if (path.startsWith('/pnpm')) return 'PNPM';
    if (path.startsWith('/snippets')) return 'Snippets';
    if (path.startsWith('/supabase')) return 'Supabase';
    if (path.startsWith('/rust')) return 'Rust';
    if (path.startsWith('/dev')) return 'Dev';
    return 'Cortex';
  });
</script>

<header class="topbar">
  <div class="topbar-left">
    <button
      class="mobile-menu-btn"
      aria-label="Open navigation"
      aria-expanded={appStore.mobileSidebarOpen}
      onclick={() => { appStore.mobileSidebarOpen = true; }}
    >
      <Icon icon="ph:sidebar-simple" width={20} height={20} />
    </button>
    <h1 class="view-title">{viewTitle()}</h1>
  </div>
  <div class="topbar-right">
    <SearchInput bind:value={appStore.searchQuery} placeholder="Search..." />
  </div>
</header>

<style>
  .topbar {
    height: var(--topbar-height);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 var(--space-8);
    background:
      linear-gradient(180deg, rgba(18, 26, 38, 0.78), rgba(12, 17, 24, 0.58)),
      var(--color-bg-secondary);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    border-bottom: 1px solid var(--color-border-subtle);
    flex-shrink: 0;
    z-index: var(--z-topbar);
  }

  .topbar-left {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    min-width: 0;
  }

  .mobile-menu-btn {
    display: none;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: var(--radius-md);
    color: var(--color-text-secondary);
    border: 1px solid var(--color-border-subtle);
    background: var(--color-bg-wash);
    transition:
      background var(--transition-fast),
      border-color var(--transition-fast),
      color var(--transition-fast),
      transform var(--transition-fast);
  }

  .mobile-menu-btn:hover {
    color: var(--color-text-primary);
    border-color: var(--color-border-default);
    background: var(--color-bg-hover);
  }

  .mobile-menu-btn:active {
    transform: scale(0.96);
  }

  .view-title {
    font-size: var(--text-base);
    font-weight: var(--weight-semibold);
    color: var(--color-text-primary);
    letter-spacing: var(--tracking-base);
    line-height: var(--leading-base);
  }

  .topbar-right {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  @media (max-width: 768px) {
    .topbar {
      padding: 0 var(--space-4);
    }
    .mobile-menu-btn {
      display: flex;
    }
  }

  @media (max-width: 560px) {
    .topbar-right {
      flex: 1;
      min-width: 0;
      justify-content: flex-end;
    }
  }
</style>
