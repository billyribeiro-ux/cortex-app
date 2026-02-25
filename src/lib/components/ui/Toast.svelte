<script lang="ts">
  import { toastStore } from '$lib/stores/toast.svelte.js';
  import Icon from '@iconify/svelte';

  const iconMap = {
    success: 'ph:check-circle',
    error: 'ph:warning-circle',
    info: 'ph:info',
  } as const;
</script>

{#if toastStore.toasts.length > 0}
  <div class="toast-container" role="status" aria-live="polite">
    {#each toastStore.toasts as toast (toast.id)}
      <div class="toast toast--{toast.type}">
        <Icon icon={iconMap[toast.type]} width={16} height={16} />
        <span class="toast-message">{toast.message}</span>
        <button
          class="toast-dismiss"
          onclick={() => toastStore.dismiss(toast.id)}
          aria-label="Dismiss"
        >
          <Icon icon="ph:x" width={12} height={12} />
        </button>
      </div>
    {/each}
  </div>
{/if}

<style>
  .toast-container {
    position: fixed;
    bottom: var(--space-6);
    right: var(--space-6);
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    z-index: 9999;
    pointer-events: none;
  }

  .toast {
    position: relative;
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-4);
    padding-left: calc(var(--space-4) + 6px);
    border-radius: var(--radius-lg);
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
    background: var(--color-bg-elevated);
    border: 1px solid var(--color-border-default);
    box-shadow: var(--shadow-lg);
    color: var(--color-text-primary);
    pointer-events: auto;
    animation: toast-in var(--transition-spring);
    max-width: 380px;
    overflow: hidden;
  }

  .toast::before {
    content: '';
    position: absolute;
    left: 0;
    top: var(--space-2);
    bottom: var(--space-2);
    width: 2px;
    border-radius: var(--radius-full);
  }

  .toast--success {
    color: var(--color-accent-success);
  }

  .toast--success::before {
    background: var(--color-accent-success);
  }

  .toast--error {
    color: var(--color-accent-danger);
  }

  .toast--error::before {
    background: var(--color-accent-danger);
  }

  .toast--info {
    color: var(--color-accent-primary);
  }

  .toast--info::before {
    background: var(--color-accent-primary);
  }

  .toast-message {
    flex: 1;
    color: var(--color-text-primary);
  }

  .toast-dismiss {
    display: flex;
    align-items: center;
    color: var(--color-text-tertiary);
    flex-shrink: 0;
    transition: color var(--transition-fast);
  }

  .toast-dismiss:hover {
    color: var(--color-text-primary);
  }

  @keyframes toast-in {
    from {
      opacity: 0;
      transform: translateY(8px) scale(0.96);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
</style>
