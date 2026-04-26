<script lang="ts">
  import Icon from '@iconify/svelte';

  interface Props {
    label: string;
    title?: string;
    onback: () => void;
  }

  let { label, title = 'Detail', onback }: Props = $props();
</script>

<div class="detail-toolbar">
  <button class="detail-back-btn" onclick={onback} aria-label={`Back to ${label} list`}>
    <Icon icon="ph:arrow-left" width={16} height={16} />
    <span>Back</span>
  </button>
  <div class="detail-toolbar-meta" aria-hidden="true">
    <span>{label}</span>
    <Icon icon="ph:caret-right" width={12} height={12} />
    <strong>{title}</strong>
  </div>
</div>

<style>
  .detail-toolbar {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    min-height: 42px;
    padding: 0 var(--space-4);
    background:
      linear-gradient(180deg, rgba(18, 26, 38, 0.74), rgba(11, 16, 23, 0.62)),
      var(--color-bg-secondary);
    border-bottom: 1px solid var(--color-border-subtle);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    flex-shrink: 0;
  }

  .detail-back-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1-5);
    height: 30px;
    padding: 0 var(--space-2);
    border-radius: var(--radius-sm);
    color: var(--color-text-secondary);
    background: rgba(255, 255, 255, 0.035);
    border: 1px solid var(--color-border-subtle);
    font-size: var(--text-xs);
    font-weight: var(--weight-semibold);
    transition:
      background var(--transition-fast),
      border-color var(--transition-fast),
      color var(--transition-fast),
      transform var(--transition-fast);
  }

  .detail-back-btn:hover {
    color: var(--color-text-primary);
    background: var(--color-bg-hover);
    border-color: var(--color-border-default);
  }

  .detail-back-btn:active {
    transform: scale(0.97);
  }

  .detail-toolbar-meta {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    min-width: 0;
    color: var(--color-text-tertiary);
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
  }

  .detail-toolbar-meta strong {
    color: var(--color-text-secondary);
    font-weight: var(--weight-semibold);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  @media (min-width: 900px) {
    .detail-back-btn span {
      display: inline;
    }
  }
</style>
