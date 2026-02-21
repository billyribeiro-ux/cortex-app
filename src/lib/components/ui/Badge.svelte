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
    min-width: 18px;
    height: 18px;
    padding: 0 var(--space-1);
    border-radius: 9px;
    font-size: var(--text-xs);
    font-weight: 600;
    line-height: 1;
    flex-shrink: 0;
  }

  .badge--default {
    background: var(--color-bg-elevated);
    color: var(--color-text-tertiary);
  }

  .badge--accent {
    background: rgba(108, 92, 231, 0.2);
    color: var(--color-accent-primary);
  }

  .badge--warning {
    background: rgba(253, 203, 110, 0.15);
    color: var(--color-accent-warning);
  }

  .badge--danger {
    background: rgba(225, 112, 85, 0.15);
    color: var(--color-accent-danger);
  }

  .badge--success {
    background: rgba(0, 184, 148, 0.15);
    color: var(--color-accent-success);
  }
</style>
