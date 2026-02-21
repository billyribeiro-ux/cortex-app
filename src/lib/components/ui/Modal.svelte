<script lang="ts">
  import type { Snippet } from 'svelte';
  import Icon from '@iconify/svelte';

  const FOCUS_SELECTOR = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

  interface Props {
    open: boolean;
    onclose: () => void;
    title: string;
    maxWidth?: string;
    footerAlign?: 'end' | 'between';
    children: Snippet;
    footer?: Snippet;
  }

  let { open, onclose, title, maxWidth = '600px', footerAlign = 'end', children, footer }: Props = $props();
  let modalRef = $state<HTMLDivElement | null>(null);
  let previousActiveElement = $state<Element | null>(null);
  const titleId = 'modal-title-' + crypto.randomUUID().slice(0, 8);

  $effect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      previousActiveElement = document.activeElement;
      queueMicrotask(() => {
        const el = modalRef;
        if (!el) return;
        const focusables = Array.from(el.querySelectorAll<HTMLElement>(FOCUS_SELECTOR));
        const first = focusables[0];
        if (first) first.focus();
        else el.focus();
      });
    } else {
      document.body.style.overflow = '';
      if (previousActiveElement && typeof (previousActiveElement as HTMLElement).focus === 'function') {
        (previousActiveElement as HTMLElement).focus();
      }
    }
    return () => {
      document.body.style.overflow = '';
    };
  });

  function handleKeydown(e: KeyboardEvent): void {
    if (e.key === 'Escape') onclose();
  }

  function handleModalKeydown(e: KeyboardEvent): void {
    if (e.key !== 'Tab') return;
    const el = modalRef;
    if (!el) return;
    const focusables = Array.from(el.querySelectorAll<HTMLElement>(FOCUS_SELECTOR));
    if (focusables.length === 0) return;
    const first = focusables[0]!;
    const last = focusables[focusables.length - 1]!;
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  function handleBackdropClick(e: MouseEvent): void {
    if (e.target === e.currentTarget) onclose();
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <div
    class="backdrop"
    role="presentation"
    tabindex="-1"
    onclick={handleBackdropClick}
    onkeydown={(e) => e.key === 'Escape' && onclose()}
  >
    <div
      bind:this={modalRef}
      class="modal-card"
      style:max-width={maxWidth}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabindex="-1"
      onkeydown={handleModalKeydown}
    >
      <div class="modal-header">
        <h2 id={titleId} class="modal-title">{title}</h2>
        <button class="close-btn" onclick={onclose} aria-label="Close modal">
          <Icon icon="ph:x" width={18} height={18} />
        </button>
      </div>
      <div class="modal-body">
        {@render children()}
      </div>
      {#if footer}
        <div class="modal-footer" class:footer-between={footerAlign === 'between'}>
          {@render footer()}
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: var(--space-4);
    animation: fade-in var(--transition-fast) ease;
  }

  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .modal-card {
    width: 100%;
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-lg);
    display: flex;
    flex-direction: column;
    max-height: 90vh;
    animation: slide-up var(--transition-fast) ease;
  }

  @keyframes slide-up {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
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
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: var(--radius-md);
    color: var(--color-text-tertiary);
    transition: background var(--transition-fast), color var(--transition-fast);
  }

  .close-btn:hover {
    background: var(--color-bg-hover);
    color: var(--color-text-primary);
  }

  .modal-body {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-6);
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
