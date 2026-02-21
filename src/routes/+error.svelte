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
  <a href="/" class="back-btn">
    <Icon icon="ph:arrow-left" width={16} height={16} />
    Back to Dashboard
  </a>
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
    margin-top: var(--space-4);
  }

  .back-btn:hover {
    background: var(--color-accent-primary-hover);
  }
</style>
