<script lang="ts">
  import type { Snippet } from 'svelte';
  import Icon from '@iconify/svelte';
  import { fade, scale } from 'svelte/transition';
  import { backOut } from 'svelte/easing';

  /**
   * Props for the Modal component
   */
  interface Props {
    /** Whether the modal is currently open */
    open: boolean;
    /** Callback fired when the modal requests to close */
    onclose: () => void;
    /** The title of the modal */
    title: string;
    /** Maximum width of the modal dialog */
    maxWidth?: string;
    /** Alignment of the footer content */
    footerAlign?: 'end' | 'between';
    /** Accessible description ID for screen readers */
    ariaDescribedBy?: string;
    /** The main content of the modal */
    children: Snippet;
    /** The footer content of the modal */
    footer?: Snippet;
  }

  let { 
    open, 
    onclose, 
    title, 
    maxWidth = '600px', 
    footerAlign = 'end', 
    ariaDescribedBy,
    children, 
    footer 
  }: Props = $props();
  
  let dialogRef = $state<HTMLDialogElement | null>(null);
  const titleId = 'modal-title-' + crypto.randomUUID().slice(0, 8);

  $effect(() => {
    if (open && dialogRef && !dialogRef.open) {
      try {
        dialogRef.showModal();
        document.body.style.overflow = 'hidden';
      } catch (e) {
        console.error('Failed to open modal:', e);
      }
    } else if (!open && dialogRef && dialogRef.open) {
      try {
        dialogRef.close();
        document.body.style.overflow = '';
      } catch (e) {
        console.error('Failed to close modal:', e);
      }
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  });

  /**
   * Handles the close button click
   */
  function handleClose() {
    onclose();
  }

  /**
   * Handles clicks on the dialog backdrop
   */
  function handleBackdropClick(e: MouseEvent) {
    if (e.target === dialogRef) {
      onclose();
    }
  }
</script>

{#if open}
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <dialog
    bind:this={dialogRef}
    class="modal-dialog"
    style:--max-width={maxWidth}
    aria-labelledby={titleId}
    aria-describedby={ariaDescribedBy}
    aria-modal="true"
    onclose={handleClose}
    onclick={handleBackdropClick}
    onkeydown={(e) => e.key === 'Escape' && onclose()}
    transition:fade={{ duration: 150 }}
  >
    <div 
      class="modal-content"
      in:scale={{ duration: 300, start: 0.96, easing: backOut }}
      out:scale={{ duration: 150, start: 0.98 }}
    >
      <div class="modal-header">
        <h2 id={titleId} class="modal-title">{title}</h2>
        <button class="close-btn" onclick={onclose} aria-label="Close modal">
          <Icon icon="ph:x" width={24} height={24} />
        </button>
      </div>
      <div class="modal-body" id={ariaDescribedBy}>
        {@render children()}
      </div>
      {#if footer}
        <div class="modal-footer" class:footer-between={footerAlign === 'between'}>
          {@render footer()}
        </div>
      {/if}
    </div>
  </dialog>
{/if}

<style>
  .modal-dialog {
    padding: 0;
    margin: auto;
    background: transparent;
    border: none;
    max-width: var(--max-width);
    width: 100%;
    overflow: visible;
  }

  .modal-dialog::backdrop {
    background: rgba(0, 0, 0, 0.65);
    backdrop-filter: blur(4px);
  }

  .modal-content {
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-xl);
    display: flex;
    flex-direction: column;
    max-height: 90vh;
    width: 100%;
    color: var(--color-text-primary);
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-4) var(--space-6);
    border-bottom: 1px solid var(--color-border-subtle);
    flex-shrink: 0;
  }

  .modal-title {
    font-size: var(--text-lg);
    font-weight: var(--weight-semibold);
    color: var(--color-text-primary);
    letter-spacing: var(--tracking-lg);
    margin: 0;
  }

  .close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: var(--radius-md);
    color: var(--color-text-tertiary);
    transition: background var(--transition-fast),
                color var(--transition-fast),
                transform var(--transition-fast);
  }

  .close-btn:hover {
    background: var(--color-bg-hover);
    color: var(--color-text-primary);
  }

  .close-btn:active {
    transform: scale(0.92);
  }

  .modal-body {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-6) var(--space-8);
  }

  .modal-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: var(--space-3);
    padding: var(--space-4) var(--space-6);
    border-top: 1px solid var(--color-border-subtle);
    flex-shrink: 0;
  }

  .modal-footer.footer-between {
    justify-content: space-between;
  }
</style>
