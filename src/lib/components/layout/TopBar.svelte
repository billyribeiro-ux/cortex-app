<script lang="ts">
  import { page } from '$app/state';
  import { appStore } from '$lib/stores/app.svelte.js';
  import SearchInput from '$lib/components/ui/SearchInput.svelte';

  const viewTitle = $derived((): string => {
    const path = page.url.pathname;
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/notes')) return 'Notes';
    if (path.startsWith('/tasks')) return 'Tasks';
    if (path.startsWith('/goals')) return 'Goals';
    return 'Cortex';
  });
</script>

<header class="topbar">
  <h1 class="view-title">{viewTitle()}</h1>
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
    padding: 0 var(--space-6);
    background: var(--color-bg-secondary);
    border-bottom: 1px solid var(--color-border-subtle);
    flex-shrink: 0;
  }

  .view-title {
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--color-text-primary);
    letter-spacing: -0.01em;
  }

  .topbar-right {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }
</style>
