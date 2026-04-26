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

<div
  class="app-shell"
  class:transitions-ready={mounted}
  class:sidebar-open={appStore.mobileSidebarOpen}
  style:--current-sidebar-width={sidebarWidth}
>
  <Sidebar />
  <button
    class="sidebar-scrim"
    aria-label="Close navigation"
    onclick={() => { appStore.mobileSidebarOpen = false; }}
  ></button>
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
    background:
      linear-gradient(135deg, rgba(255, 255, 255, 0.035), transparent 34%),
      linear-gradient(180deg, var(--color-bg-primary), var(--color-bg-canvas));
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
    position: relative;
    z-index: 1;
  }

  .sidebar-scrim {
    display: none;
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
      width: var(--sidebar-width);
      transform: translateX(calc(-1 * var(--sidebar-width)));
      box-shadow: var(--shadow-xl);
    }
    .app-shell.sidebar-open :global(.sidebar) {
      transform: translateX(0);
    }
    .sidebar-scrim {
      position: fixed;
      inset: 0;
      z-index: calc(var(--z-modal) - 1);
      display: block;
      pointer-events: none;
      opacity: 0;
      background: rgba(2, 6, 12, 0.58);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      transition: opacity var(--transition-normal);
    }
    .app-shell.sidebar-open .sidebar-scrim {
      pointer-events: auto;
      opacity: 1;
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
