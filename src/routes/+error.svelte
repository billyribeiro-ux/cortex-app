<script lang="ts">
  import { page } from '$app/state';
</script>

<div class="error-page">
  <h1>{page.status}</h1>
  <p>{page.error?.message ?? 'Something went wrong'}</p>
  <a href="/">Back to Dashboard</a>
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
  }

  h1 {
    font-size: var(--text-3xl);
    font-weight: 700;
    color: var(--color-text-primary);
  }

  p {
    color: var(--color-text-secondary);
    font-size: var(--text-base);
  }

  a {
    color: var(--color-accent-primary);
    font-size: var(--text-sm);
    font-weight: 500;
    transition: color var(--transition-fast);
  }

  a:hover {
    color: var(--color-accent-primary-hover);
  }
</style>
