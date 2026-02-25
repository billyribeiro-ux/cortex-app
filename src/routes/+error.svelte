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
    gap: var(--space-5);
    height: 100%;
    text-align: center;
    padding: var(--space-8);
  }

  .error-icon {
    color: var(--color-accent-danger);
    opacity: 0.5;
  }

  .error-code {
    font-size: 4rem;
    font-weight: var(--weight-bold);
    color: var(--color-text-primary);
    letter-spacing: var(--tracking-3xl);
    line-height: var(--leading-3xl);
  }

  .error-message {
    color: var(--color-text-secondary);
    font-size: var(--text-lg);
    font-weight: var(--weight-medium);
    letter-spacing: var(--tracking-lg);
    line-height: var(--leading-lg);
    max-width: 400px;
  }

  .error-hint {
    color: var(--color-text-tertiary);
    font-size: var(--text-sm);
    letter-spacing: var(--tracking-sm);
    line-height: var(--leading-sm);
    max-width: 400px;
  }

  .error-actions {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    margin-top: var(--space-6);
  }

  .back-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-5);
    min-height: 44px;
    background: var(--color-accent-primary);
    color: #fff;
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    font-weight: var(--weight-semibold);
    letter-spacing: var(--tracking-sm);
    text-decoration: none;
    box-shadow: var(--shadow-sm);
    transition: background var(--transition-fast), box-shadow var(--transition-fast), transform var(--transition-fast);
  }

  .back-btn:hover {
    background: var(--color-accent-primary-hover);
    box-shadow: var(--shadow-md);
  }

  .back-btn:active {
    transform: scale(0.97);
    box-shadow: var(--shadow-xs);
  }

  .reload-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-5);
    min-height: 44px;
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
    letter-spacing: var(--tracking-sm);
    color: var(--color-text-secondary);
    transition: background var(--transition-fast), color var(--transition-fast), transform var(--transition-fast), box-shadow var(--transition-fast);
  }

  .reload-btn:hover {
    background: var(--color-bg-hover);
    color: var(--color-text-primary);
  }

  .reload-btn:active {
    transform: scale(0.97);
  }
</style>
