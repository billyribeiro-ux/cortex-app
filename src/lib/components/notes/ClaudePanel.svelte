<script lang="ts">
  import { notesStore } from '$lib/stores/notes.svelte.js';
  import type { ClaudeMessage } from '$lib/types/index.js';
  import Icon from '@iconify/svelte';

  let inputValue = $state('');
  let messagesEl = $state<HTMLDivElement | null>(null);

  $effect(() => {
    // Auto-scroll to bottom when messages change
    if (notesStore.claudeMessages.length > 0 && messagesEl) {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }
  });

  function sendMessage(): void {
    const content = inputValue.trim();
    if (!content) return;

    const userMsg: ClaudeMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    notesStore.addClaudeMessage(userMsg);
    inputValue = '';

    // Mock response after 500ms
    setTimeout(() => {
      const assistantMsg: ClaudeMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content:
          'Claude integration will be connected when the Rust backend is ready. For now, this is a placeholder.',
        timestamp: new Date().toISOString(),
      };
      notesStore.addClaudeMessage(assistantMsg);
    }, 500);
  }

  function handleKeydown(e: KeyboardEvent): void {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }
</script>

<div class="claude-panel">
  <div class="panel-header">
    <div class="panel-title">
      <Icon icon="ph:sparkle" width={16} height={16} />
      <span>Ask Claude</span>
    </div>
    <button
      class="close-btn"
      onclick={() => notesStore.toggleClaudePanel()}
      aria-label="Close Claude panel"
    >
      <Icon icon="ph:x" width={16} height={16} />
    </button>
  </div>

  {#if notesStore.activeNote}
    <div class="context-hint">
      <Icon icon="ph:file-text" width={12} height={12} />
      <span>Context: {notesStore.activeNote.title || 'Untitled Note'}</span>
    </div>
  {/if}

  <div class="messages" bind:this={messagesEl}>
    {#if notesStore.claudeMessages.length === 0}
      <div class="empty-messages">
        <Icon icon="ph:chat-dots" width={32} height={32} />
        <p>Ask Claude anything about your note. Responses will appear here.</p>
      </div>
    {:else}
      {#each notesStore.claudeMessages as msg (msg.id)}
        <div class="message" class:user={msg.role === 'user'} class:assistant={msg.role === 'assistant'}>
          <span class="message-role">{msg.role === 'user' ? 'You' : 'Claude'}</span>
          <p class="message-content selectable">{msg.content}</p>
        </div>
      {/each}
    {/if}
  </div>

  <div class="input-area">
    <textarea
      class="claude-input selectable"
      placeholder="Ask a question..."
      bind:value={inputValue}
      onkeydown={handleKeydown}
      rows={3}
    ></textarea>
    <button
      class="send-btn"
      onclick={sendMessage}
      disabled={!inputValue.trim()}
      aria-label="Send message"
    >
      <Icon icon="ph:paper-plane-right" width={16} height={16} />
    </button>
  </div>
</div>

<style>
  .claude-panel {
    width: 300px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    background: var(--color-bg-secondary);
    border-left: 1px solid var(--color-border-subtle);
    overflow: hidden;
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-3) var(--space-4);
    border-bottom: 1px solid var(--color-border-subtle);
    flex-shrink: 0;
  }

  .panel-title {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--color-accent-primary);
  }

  .close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: var(--radius-sm);
    color: var(--color-text-tertiary);
    transition: background var(--transition-fast), color var(--transition-fast);
  }

  .close-btn:hover {
    background: var(--color-bg-hover);
    color: var(--color-text-primary);
  }

  .context-hint {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    padding: var(--space-2) var(--space-4);
    font-size: var(--text-xs);
    color: var(--color-text-tertiary);
    background: var(--color-bg-tertiary);
    border-bottom: 1px solid var(--color-border-subtle);
    flex-shrink: 0;
  }

  .messages {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-3);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .empty-messages {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-3);
    height: 100%;
    text-align: center;
    color: var(--color-text-tertiary);
    padding: var(--space-6);
  }

  .empty-messages p {
    font-size: var(--text-xs);
    line-height: 1.5;
  }

  .message {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    max-width: 90%;
  }

  .message.user {
    align-self: flex-end;
    align-items: flex-end;
  }

  .message.assistant {
    align-self: flex-start;
    align-items: flex-start;
  }

  .message-role {
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--color-text-tertiary);
  }

  .message-content {
    font-size: var(--text-xs);
    line-height: 1.5;
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-md);
    white-space: pre-wrap;
    word-break: break-word;
  }

  .message.user .message-content {
    background: var(--color-accent-primary);
    color: #fff;
    border-bottom-right-radius: 2px;
  }

  .message.assistant .message-content {
    background: var(--color-bg-elevated);
    color: var(--color-text-primary);
    border-bottom-left-radius: 2px;
  }

  .input-area {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    padding: var(--space-3);
    border-top: 1px solid var(--color-border-subtle);
    flex-shrink: 0;
  }

  .claude-input {
    width: 100%;
    padding: var(--space-2) var(--space-3);
    background: var(--color-bg-tertiary);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-md);
    font-size: var(--text-xs);
    color: var(--color-text-primary);
    resize: none;
    line-height: 1.5;
    transition: border-color var(--transition-fast);
  }

  .claude-input:focus {
    outline: none;
    border-color: var(--color-accent-primary);
  }

  .claude-input::placeholder {
    color: var(--color-text-tertiary);
  }

  .send-btn {
    align-self: flex-end;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: var(--color-accent-primary);
    color: #fff;
    border-radius: var(--radius-md);
    transition: background var(--transition-fast), opacity var(--transition-fast);
  }

  .send-btn:hover:not(:disabled) {
    background: var(--color-accent-primary-hover);
  }

  .send-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
</style>
