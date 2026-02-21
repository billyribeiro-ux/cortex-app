<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import Sidebar from '$lib/components/layout/Sidebar.svelte';
  import TopBar from '$lib/components/layout/TopBar.svelte';
  import Toast from '$lib/components/ui/Toast.svelte';
  import { appStore } from '$lib/stores/app.svelte.js';
  let { children } = $props();

  let mounted = $state(false);
  onMount(() => { mounted = true; });

  const sidebarWidth = $derived(
    appStore.sidebarCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)'
  );
</script>

<div class="app-shell">
  <Sidebar />
  <div class="main-area" class:transitions-ready={mounted} style:--current-sidebar-width={sidebarWidth}>
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

<Toast />

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
    min-width: 0;
  }

  .main-area.transitions-ready {
    transition: margin-left var(--transition-normal);
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
