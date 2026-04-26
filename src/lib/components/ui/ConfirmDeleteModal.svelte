<script lang="ts">
  import Icon from '@iconify/svelte';
  import Modal from '$lib/components/ui/Modal.svelte';

  interface Props {
    open: boolean;
    itemLabel: string;
    itemTitle?: string;
    oncancel: () => void;
    onconfirm: () => void;
  }

  let { open, itemLabel, itemTitle = 'Untitled', oncancel, onconfirm }: Props = $props();
</script>

<Modal open={open} onclose={oncancel} title={`Delete ${itemLabel}`} maxWidth="440px">
  {#snippet children()}
    <div class="delete-body">
      <div class="delete-icon" aria-hidden="true">
        <Icon icon="ph:trash" width={22} height={22} />
      </div>
      <div class="delete-copy">
        <p class="delete-title">{itemTitle}</p>
        <p class="delete-text">
          This removes the {itemLabel.toLowerCase()} from this app. This action cannot be undone.
        </p>
      </div>
    </div>
  {/snippet}

  {#snippet footer()}
    <button class="modal-btn secondary" onclick={oncancel}>Cancel</button>
    <button class="modal-btn danger" onclick={onconfirm}>
      <Icon icon="ph:trash" width={15} height={15} />
      Delete
    </button>
  {/snippet}
</Modal>

<style>
  .delete-body {
    display: grid;
    grid-template-columns: 42px 1fr;
    gap: var(--space-4);
    align-items: start;
  }

  .delete-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    border-radius: var(--radius-md);
    color: var(--color-accent-danger);
    background: var(--color-accent-danger-muted);
    border: 1px solid color-mix(in srgb, var(--color-accent-danger) 22%, transparent);
  }

  .delete-copy {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    min-width: 0;
  }

  .delete-title {
    margin: 0;
    color: var(--color-text-primary);
    font-size: var(--text-base);
    font-weight: var(--weight-semibold);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .delete-text {
    margin: 0;
    color: var(--color-text-secondary);
    font-size: var(--text-sm);
    line-height: var(--leading-base);
  }

  .modal-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    min-height: 36px;
    padding: 0 var(--space-3);
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    font-weight: var(--weight-semibold);
    transition:
      background var(--transition-fast),
      border-color var(--transition-fast),
      color var(--transition-fast),
      transform var(--transition-fast);
  }

  .modal-btn:active {
    transform: scale(0.97);
  }

  .modal-btn.secondary {
    color: var(--color-text-secondary);
    background: rgba(255, 255, 255, 0.035);
    border: 1px solid var(--color-border-default);
  }

  .modal-btn.secondary:hover {
    color: var(--color-text-primary);
    background: var(--color-bg-hover);
  }

  .modal-btn.danger {
    color: #210805;
    background: var(--color-accent-danger);
    border: 1px solid color-mix(in srgb, var(--color-accent-danger) 70%, white);
  }

  .modal-btn.danger:hover {
    background: color-mix(in srgb, var(--color-accent-danger) 88%, white);
  }
</style>
