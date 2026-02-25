<script lang="ts">
  interface Props {
    value: number;
    variant?: 'default' | 'accent' | 'warning' | 'danger' | 'success';
  }

  let { value, variant = 'default' }: Props = $props();
</script>

<span class={['badge', `badge--${variant}`]}>
  {value > 99 ? '99+' : value}
</span>

<style>
  .badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 20px;
    padding: 0 var(--space-1);
    border-radius: var(--radius-full);
    font-size: var(--text-xs);
    font-weight: var(--weight-semibold);
    letter-spacing: var(--tracking-xs);
    line-height: 1;
    flex-shrink: 0;
  }

  .badge--default {
    background: var(--color-bg-elevated);
    color: var(--color-text-tertiary);
  }

  .badge--accent {
    background: var(--color-accent-primary-muted);
    color: var(--color-accent-primary);
  }

  .badge--warning {
    background: rgba(240, 197, 90, 0.12);
    color: var(--color-accent-warning);
  }

  .badge--danger {
    background: var(--color-accent-danger-muted);
    color: var(--color-accent-danger);
  }

  .badge--success {
    background: var(--color-accent-success-muted);
    color: var(--color-accent-success);
  }
</style>
