<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import Sidebar from '$lib/components/layout/Sidebar.svelte';
  import TopBar from '$lib/components/layout/TopBar.svelte';
  import Toast from '$lib/components/ui/Toast.svelte';
  import CommandPalette from '$lib/components/ui/CommandPalette.svelte';
  import { appStore } from '$lib/stores/app.svelte.js';
  let { children } = $props();

  let mounted = $state(false);
  onMount(() => { mounted = true; });

  const sidebarWidth = $derived(
    appStore.sidebarCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)'
  );
</script>

<div class="app-shell" class:transitions-ready={mounted} class:sidebar-open={!appStore.sidebarCollapsed} style:--current-sidebar-width={sidebarWidth}>
  <Sidebar />
  <div class="main-area">
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
<CommandPalette />

<style>
  .app-shell {
    display: flex;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
  }

  .app-shell :global(.sidebar) {
    width: var(--current-sidebar-width);
    transition: width var(--transition-slow);
    flex-shrink: 0;
  }

  .main-area {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
    min-height: 0;
  }

  .content {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-8);
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  @media (max-width: 768px) {
    .app-shell :global(.sidebar) {
      position: fixed;
      z-index: var(--z-modal);
      transform: translateX(calc(-1 * var(--current-sidebar-width)));
    }
    .app-shell.sidebar-open :global(.sidebar) {
      transform: translateX(0);
    }
    .content {
      padding: var(--space-4);
    }
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
    padding: var(--space-2) var(--space-5);
    min-height: 44px;
    background: var(--color-accent-primary);
    color: var(--color-text-primary);
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    font-weight: var(--weight-semibold);
    letter-spacing: var(--tracking-sm);
    line-height: var(--leading-sm);
    box-shadow: var(--shadow-sm);
    transition:
      background var(--transition-fast),
      box-shadow var(--transition-fast),
      transform var(--transition-fast);
  }

  .error-state button:hover {
    background: var(--color-accent-primary-hover);
    box-shadow: var(--shadow-md);
  }

  .error-state button:active {
    transform: scale(0.98);
    box-shadow: var(--shadow-xs);
  }
</style>
