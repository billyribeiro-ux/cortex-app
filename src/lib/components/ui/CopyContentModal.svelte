<script lang="ts">
  import { tick } from 'svelte';
  import Icon from '@iconify/svelte';
  import Modal from '$lib/components/ui/Modal.svelte';

  interface Props {
    open: boolean;
    title?: string;
    text: string;
    onclose: () => void;
  }

  let { open, title = 'Copy Content', text, onclose }: Props = $props();
  let textareaRef = $state<HTMLTextAreaElement | null>(null);

  $effect(() => {
    if (!open) return;
    tick().then(() => {
      textareaRef?.focus();
      textareaRef?.select();
    });
  });

  function selectText(): void {
    textareaRef?.focus();
    textareaRef?.select();
  }
</script>

<Modal {open} {title} onclose={onclose} maxWidth="560px">
  {#snippet children()}
    <div class="copy-body">
      <p class="copy-note">Clipboard access is restricted here. The content is selected so you can copy it directly.</p>
      <textarea
        bind:this={textareaRef}
        class="copy-text selectable"
        readonly
        value={text}
        aria-label="Content to copy"
      ></textarea>
    </div>
  {/snippet}

  {#snippet footer()}
    <button class="copy-btn secondary" onclick={selectText}>
      <Icon icon="ph:text-aa" width={15} height={15} />
      Select all
    </button>
    <button class="copy-btn primary" onclick={onclose}>Done</button>
  {/snippet}
</Modal>

<style>
  .copy-body {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .copy-note {
    margin: 0;
    color: var(--color-text-secondary);
    font-size: var(--text-sm);
    line-height: var(--leading-base);
  }

  .copy-text {
    width: 100%;
    min-height: 180px;
    padding: var(--space-3);
    color: var(--color-text-primary);
    background: rgba(5, 9, 15, 0.7);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-md);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    line-height: var(--leading-base);
    resize: vertical;
  }

  .copy-text:focus {
    outline: 2px solid rgba(143, 184, 255, 0.26);
    outline-offset: -1px;
    border-color: var(--color-accent-primary);
  }

  .copy-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    min-height: 36px;
    padding: 0 var(--space-3);
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    font-weight: var(--weight-semibold);
  }

  .copy-btn.secondary {
    color: var(--color-text-secondary);
    background: rgba(255, 255, 255, 0.035);
    border: 1px solid var(--color-border-default);
  }

  .copy-btn.primary {
    color: var(--color-text-inverse);
    background: var(--color-accent-primary);
  }
</style>
