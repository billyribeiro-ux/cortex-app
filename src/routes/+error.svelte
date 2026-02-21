<script lang="ts">
  import { page } from '$app/state';
  import Icon from '@iconify/svelte';
</script>

<div class="error-page">
  <div class="error-icon">
    <Icon icon="ph:warning-circle" width={64} height={64} />
  </div>
  <h1 class="error-code">{page.status}</h1>
  <p class="error-message">{page.error?.message ?? 'Something went wrong'}</p>
  <p class="error-hint">
    {#if page.status === 404}
      The page you're looking for doesn't exist or has been moved.
    {:else}
      An unexpected error occurred. Try refreshing or return to the dashboard.
    {/if}
  </p>
  <div class="error-actions">
    <a href="/" class="back-btn">
      <Icon icon="ph:arrow-left" width={16} height={16} />
      Back to Dashboard
    </a>
    <button class="reload-btn" onclick={() => location.reload()}>
      <Icon icon="ph:arrow-clockwise" width={16} height={16} />
      Reload
    </button>
  </div>
</div>

<style>
  .error-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-4);
    height: 100%;
    text-align: center;
    padding: var(--space-8);
  }

  .error-icon {
    color: var(--color-accent-danger);
    opacity: 0.6;
  }

  .error-code {
    font-size: var(--text-3xl);
    font-weight: 700;
    color: var(--color-text-primary);
    letter-spacing: -0.03em;
  }

  .error-message {
    color: var(--color-text-secondary);
    font-size: var(--text-base);
    max-width: 400px;
    line-height: 1.5;
  }

  .error-hint {
    color: var(--color-text-tertiary);
    font-size: var(--text-sm);
    max-width: 400px;
    line-height: 1.5;
  }

  .error-actions {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    margin-top: var(--space-4);
  }

  .back-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-5);
    background: var(--color-accent-primary);
    color: #fff;
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    font-weight: 500;
    text-decoration: none;
    transition: background var(--transition-fast);
  }

  .back-btn:hover {
    background: var(--color-accent-primary-hover);
  }

  .reload-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-5);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--color-text-secondary);
    transition: background var(--transition-fast), color var(--transition-fast);
  }

  .reload-btn:hover {
    background: var(--color-bg-hover);
    color: var(--color-text-primary);
  }
</style>
