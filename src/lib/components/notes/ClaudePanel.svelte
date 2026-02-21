<script lang="ts">
  import { onDestroy } from 'svelte';
  import { notesStore } from '$lib/stores/notes.svelte.js';
  import { renderMarkdown } from '$lib/utils/markdown.js';
  import type { ClaudeMessage } from '$lib/types/index.js';
  import Icon from '@iconify/svelte';

  const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;
  const hasApiKey = $derived(!!API_KEY && API_KEY !== 'undefined');

  const REQUEST_TIMEOUT_MS = 30_000;
  const COOLDOWN_MS = 1_000;

  let inputValue = $state('');
  let isLoading = $state(false);
  let errorMsg = $state('');
  let messagesEl = $state<HTMLDivElement | null>(null);
  let abortController = $state<AbortController | null>(null);
  let lastSentAt = $state(0);

  const isCoolingDown = $derived(Date.now() - lastSentAt < COOLDOWN_MS && !isLoading);

  onDestroy(() => {
    abortController?.abort();
  });

  $effect(() => {
    if (notesStore.claudeMessages.length > 0 && messagesEl) {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }
  });

  function cancelRequest(): void {
    abortController?.abort();
    abortController = null;
    isLoading = false;
  }

  async function sendMessage(): Promise<void> {
    const content = inputValue.trim();
    if (!content || isLoading) return;

    if (!hasApiKey) {
      errorMsg = 'API key not configured. Add VITE_ANTHROPIC_API_KEY to your .env file and rebuild.';
      return;
    }

    errorMsg = '';
    lastSentAt = Date.now();

    const userMsg: ClaudeMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    notesStore.addClaudeMessage(userMsg);
    inputValue = '';
    isLoading = true;

    const controller = new AbortController();
    abortController = controller;
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    const activeNote = notesStore.activeNote;
    const systemPrompt = activeNote
      ? `You are a helpful assistant. The user is working on a note titled "${activeNote.title}". Here is the note content:\n\n${activeNote.content}\n\nHelp the user with questions about this note or related topics.`
      : 'You are a helpful assistant for a personal knowledge management app called Cortex.';

    const history = notesStore.claudeMessages.slice(-20).map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY!,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-request-proxy': 'true',
        },
        body: JSON.stringify({
          model: 'claude-3-5-haiku-20241022',
          max_tokens: 1024,
          system: systemPrompt,
          messages: history,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        let err: { error?: { message?: string } } = {};
        try {
          err = (await response.json()) as { error?: { message?: string } };
        } catch {
          /* ignore parse error */
        }
        throw new Error(err.error?.message ?? `HTTP ${response.status}`);
      }

      let data: { content?: Array<{ type: string; text: string }> };
      try {
        data = (await response.json()) as { content?: Array<{ type: string; text: string }> };
      } catch {
        throw new Error('Invalid response from Claude API');
      }
      const text = (data.content ?? []).find((c) => c.type === 'text')?.text ?? '';

      const assistantMsg: ClaudeMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: text,
        timestamp: new Date().toISOString(),
      };
      notesStore.addClaudeMessage(assistantMsg);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        errorMsg = 'Request cancelled.';
      } else {
        console.error('Claude API error:', err);
        errorMsg = err instanceof Error ? err.message : 'Failed to reach Claude.';
      }
    } finally {
      clearTimeout(timeout);
      abortController = null;
      isLoading = false;
    }
  }

  function handleKeydown(e: KeyboardEvent): void {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
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
    {#if !hasApiKey}
      <div class="empty-messages api-key-setup">
        <Icon icon="ph:key" width={32} height={32} />
        <p>Claude API key not configured.</p>
        <p class="setup-hint">Add <code>VITE_ANTHROPIC_API_KEY=your-key</code> to a <code>.env</code> file in the project root, then rebuild the app.</p>
      </div>
    {:else if notesStore.claudeMessages.length === 0}
      <div class="empty-messages">
        <Icon icon="ph:chat-dots" width={32} height={32} />
        <p>Ask Claude anything about your note. Responses will appear here.</p>
      </div>
    {:else}
      {#each notesStore.claudeMessages as msg (msg.id)}
        <div class="message" class:user={msg.role === 'user'} class:assistant={msg.role === 'assistant'}>
          <span class="message-role">{msg.role === 'user' ? 'You' : 'Claude'}</span>
          {#if msg.role === 'assistant'}
            <div class="message-content markdown-content selectable">
              {@html renderMarkdown(msg.content)}
            </div>
          {:else}
            <p class="message-content selectable">{msg.content}</p>
          {/if}
        </div>
      {/each}
    {/if}
  </div>

  {#if errorMsg}
    <div class="error-msg">
      <Icon icon="ph:warning" width={12} height={12} />
      {errorMsg}
    </div>
  {/if}

  <div class="input-area">
    <textarea
      class="claude-input selectable"
      placeholder={hasApiKey ? 'Ask a question...' : 'Configure API key to enable'}
      bind:value={inputValue}
      onkeydown={handleKeydown}
      rows={3}
      disabled={!hasApiKey}
    ></textarea>
    <div class="input-actions">
      {#if isLoading}
        <button
          class="cancel-btn"
          onclick={cancelRequest}
          aria-label="Cancel request"
        >
          Cancel
        </button>
      {/if}
      <button
        class="send-btn"
        onclick={() => void sendMessage()}
        disabled={!hasApiKey || !inputValue.trim() || isLoading}
        aria-label="Send message"
      >
        {#if isLoading}
          <Icon icon="ph:circle-notch" width={16} height={16} class="spin" />
        {:else}
          <Icon icon="ph:paper-plane-right" width={16} height={16} />
        {/if}
      </button>
    </div>
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

  .empty-messages.api-key-setup .setup-hint {
    font-size: 0.65rem;
    max-width: 240px;
  }

  .empty-messages code {
    font-family: var(--font-mono);
    font-size: 0.9em;
    background: var(--color-bg-tertiary);
    padding: 2px 4px;
    border-radius: var(--radius-sm);
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

  .markdown-content :global(p) { margin: 0 0 var(--space-2); }
  .markdown-content :global(p:last-child) { margin-bottom: 0; }
  .markdown-content :global(strong) { font-weight: 700; }
  .markdown-content :global(em) { font-style: italic; }
  .markdown-content :global(code) { font-family: var(--font-mono); font-size: 0.85em; background: var(--color-bg-tertiary); padding: 1px 4px; border-radius: var(--radius-sm); }
  .markdown-content :global(pre) { background: var(--color-bg-tertiary); border-radius: var(--radius-md); padding: var(--space-2); margin: var(--space-2) 0; overflow-x: auto; }
  .markdown-content :global(pre code) { background: none; padding: 0; }
  .markdown-content :global(ul), .markdown-content :global(ol) { margin: 0 0 var(--space-2) var(--space-4); padding: 0; }
  .markdown-content :global(li) { margin-bottom: var(--space-1); }
  .markdown-content :global(a) { color: var(--color-accent-secondary); text-decoration: underline; }
  .markdown-content :global(blockquote) { border-left: 2px solid var(--color-accent-primary); padding-left: var(--space-2); margin: var(--space-2) 0; color: var(--color-text-secondary); font-style: italic; }

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

  .input-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: var(--space-2);
  }

  .cancel-btn {
    font-size: var(--text-xs);
    color: var(--color-text-tertiary);
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-sm);
    transition: color var(--transition-fast), background var(--transition-fast);
  }

  .cancel-btn:hover {
    color: var(--color-accent-danger);
    background: color-mix(in srgb, var(--color-accent-danger) 10%, transparent);
  }

  .send-btn {
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

  .error-msg {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    padding: var(--space-2) var(--space-3);
    font-size: var(--text-xs);
    color: var(--color-accent-danger);
    background: color-mix(in srgb, var(--color-accent-danger) 10%, transparent);
    border-top: 1px solid var(--color-border-subtle);
    flex-shrink: 0;
  }

  :global(.spin) {
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
</style>
