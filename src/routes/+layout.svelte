<script lang="ts">
  import '../app.css';
  import Sidebar from '$lib/components/layout/Sidebar.svelte';
  import TopBar from '$lib/components/layout/TopBar.svelte';
  import { appStore } from '$lib/stores/app.svelte.js';
  let { children } = $props();

  const sidebarWidth = $derived(
    appStore.sidebarCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)'
  );
</script>

<div class="app-shell">
  <Sidebar />
  <div class="main-area" style:--current-sidebar-width={sidebarWidth}>
    <TopBar />
    <main class="content">
      <svelte:boundary>
        {@render children?.()}
        {#snippet failed(error, reset)}
          <div class="error-state">
            <p>Something went wrong.</p>
            <button onclick={reset}>Try again</button>
          </div>
        {/snippet}
      </svelte:boundary>
    </main>
  </div>
</div>

<style>
  .app-shell {
    display: flex;
    height: 100vh;
    overflow: hidden;
  }

  .main-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    margin-left: var(--current-sidebar-width);
    transition: margin-left var(--transition-normal);
    min-width: 0;
  }

  .content {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-6);
  }

  .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-4);
    height: 100%;
    color: var(--color-text-secondary);
  }

  .error-state button {
    padding: var(--space-2) var(--space-4);
    background: var(--color-accent-primary);
    color: var(--color-text-primary);
    border-radius: var(--radius-md);
    transition: background var(--transition-fast);
  }

  .error-state button:hover {
    background: var(--color-accent-primary-hover);
  }
</style>
