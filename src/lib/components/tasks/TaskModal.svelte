<script lang="ts">
  import type { Task, TaskStatus, TaskPriority, Subtask } from '$lib/types/index.js';
  import { TASK_STATUS_CONFIG, TASK_PRIORITY_CONFIG } from '$lib/types/index.js';
  import { tasksStore } from '$lib/stores/tasks.svelte.js';
  import { appStore } from '$lib/stores/app.svelte.js';
  import { formatDateForInput, parseDateInput } from '$lib/utils/time.js';
  import Modal from '$lib/components/ui/Modal.svelte';
  import TagInput from '$lib/components/ui/TagInput.svelte';
  import Icon from '@iconify/svelte';

  const isEditing = $derived(tasksStore.editingTask !== null);
  const task = $derived(tasksStore.editingTask);

  let title = $state('');
  let description = $state('');
  let status = $state<TaskStatus>('todo');
  let priority = $state<TaskPriority>('normal');
  let dueDate = $state('');
  let goalId = $state<string | null>(null);
  let tags = $state<string[]>([]);
  let subtasks = $state<Subtask[]>([]);
  let newSubtaskTitle = $state('');
  let deleteConfirm = $state(false);
  let titleInputEl = $state<HTMLInputElement | null>(null);

  $effect(() => {
    if (tasksStore.showCreateModal && titleInputEl) {
      setTimeout(() => titleInputEl?.focus(), 50);
    }
  });

  // Sync form when modal opens or editing task changes
  $effect(() => {
    if (tasksStore.showCreateModal) {
      if (task) {
        title = task.title;
        description = task.description;
        status = task.status;
        priority = task.priority;
        dueDate = formatDateForInput(task.dueDate);
        goalId = task.goalId;
        tags = [...task.tags];
        subtasks = task.subtasks.map((s) => ({ ...s }));
      } else {
        title = '';
        description = '';
        status = 'todo';
        priority = 'normal';
        dueDate = '';
        goalId = null;
        tags = [];
        subtasks = [];
      }
      deleteConfirm = false;
    }
  });

  function handleSave(): void {
    if (!title.trim()) return;

    const data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      dueDate: parseDateInput(dueDate),
      goalId,
      tags,
      subtasks,
    };

    if (isEditing && task) {
      appStore.updateTask(task.id, data);
    } else {
      tasksStore.createTask(data);
    }
    tasksStore.closeModal();
  }

  function handleDelete(): void {
    if (!deleteConfirm) {
      deleteConfirm = true;
      setTimeout(() => { deleteConfirm = false; }, 3000);
      return;
    }
    if (task) {
      appStore.deleteTask(task.id);
    }
    tasksStore.closeModal();
  }

  function addSubtask(): void {
    const t = newSubtaskTitle.trim();
    if (!t) return;
    subtasks.push({
      id: crypto.randomUUID(),
      title: t,
      isCompleted: false,
      completedAt: null,
    });
    newSubtaskTitle = '';
  }

  function toggleSubtask(id: string): void {
    const s = subtasks.find((x) => x.id === id);
    if (s) {
      s.isCompleted = !s.isCompleted;
      s.completedAt = s.isCompleted ? new Date().toISOString() : null;
    }
  }

  function removeSubtask(id: string): void {
    subtasks = subtasks.filter((s) => s.id !== id);
  }

  function handleSubtaskKeydown(e: KeyboardEvent): void {
    if (e.key === 'Enter') { e.preventDefault(); addSubtask(); }
  }

  const baseId = $props.id();
  const titleId = `${baseId}-title`;
  const descId = `${baseId}-desc`;
  const dueDateId = `${baseId}-due`;
  const goalId2 = `${baseId}-goal`;
</script>

<Modal
  open={tasksStore.showCreateModal}
  onclose={() => tasksStore.closeModal()}
  title={isEditing ? 'Edit Task' : 'New Task'}
>
  {#snippet children()}
    <div class="form">
      <!-- Title -->
      <div class="field">
        <label for={titleId} class="label">Title <span class="required">*</span></label>
        <input
          bind:this={titleInputEl}
          id={titleId}
          class="input selectable"
          type="text"
          placeholder="Task title..."
          bind:value={title}
        />
      </div>

      <!-- Description -->
      <div class="field">
        <label for={descId} class="label">Description</label>
        <textarea
          id={descId}
          class="textarea selectable"
          placeholder="Add details... (supports markdown)"
          bind:value={description}
          rows={3}
        ></textarea>
      </div>

      <!-- Status -->
      <div class="field">
        <span class="label">Status</span>
        <div class="btn-row">
          {#each Object.entries(TASK_STATUS_CONFIG) as [key, cfg]}
            <button
              class="status-btn"
              class:active={status === key}
              style:--btn-color={cfg.color}
              onclick={() => { status = key as TaskStatus; }}
            >
              <Icon icon={cfg.icon} width={14} height={14} />
              {cfg.label}
            </button>
          {/each}
        </div>
      </div>

      <!-- Priority -->
      <div class="field">
        <span class="label">Priority</span>
        <div class="btn-row">
          {#each Object.entries(TASK_PRIORITY_CONFIG) as [key, cfg]}
            <button
              class="priority-btn"
              class:active={priority === key}
              style:--btn-color={cfg.color}
              onclick={() => { priority = key as TaskPriority; }}
            >
              <Icon icon={cfg.icon} width={14} height={14} />
              {cfg.label}
            </button>
          {/each}
        </div>
      </div>

      <!-- Due Date -->
      <div class="field">
        <label for={dueDateId} class="label">Due Date</label>
        <div class="date-row">
          <input
            id={dueDateId}
            class="input date-input selectable"
            type="date"
            bind:value={dueDate}
          />
          {#if dueDate}
            <button class="clear-btn" onclick={() => { dueDate = ''; }}>Clear</button>
          {/if}
        </div>
      </div>

      <!-- Goal Link -->
      <div class="field">
        <label for={goalId2} class="label">Link to Goal</label>
        <select
          id={goalId2}
          class="select"
          value={goalId ?? ''}
          onchange={(e) => { goalId = (e.currentTarget as HTMLSelectElement).value || null; }}
        >
          <option value="">No goal</option>
          {#each appStore.goals as goal}
            <option value={goal.id}>{goal.title}</option>
          {/each}
        </select>
      </div>

      <!-- Tags -->
      <div class="field">
        <span class="label">Tags</span>
        <TagInput
          {tags}
          onAdd={(tag) => { tags = [...tags, tag]; }}
          onRemove={(tag) => { tags = tags.filter((t) => t !== tag); }}
        />
      </div>

      <!-- Subtasks -->
      <div class="field">
        <span class="label">Subtasks</span>
        <div class="subtasks">
          {#each subtasks as s (s.id)}
            <div class="subtask-row">
              <input
                type="checkbox"
                checked={s.isCompleted}
                onchange={() => toggleSubtask(s.id)}
                aria-label="Toggle subtask"
              />
              <span class="subtask-title" class:done={s.isCompleted}>{s.title}</span>
              <button class="subtask-del" onclick={() => removeSubtask(s.id)} aria-label="Remove subtask">
                <Icon icon="ph:x" width={12} height={12} />
              </button>
            </div>
          {/each}
          <div class="subtask-add-row">
            <input
              class="subtask-input selectable"
              type="text"
              placeholder="Add subtask..."
              bind:value={newSubtaskTitle}
              onkeydown={handleSubtaskKeydown}
            />
            <button class="subtask-add-btn" onclick={addSubtask} disabled={!newSubtaskTitle.trim()}>
              <Icon icon="ph:plus" width={14} height={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  {/snippet}

  {#snippet footer()}
    <div class="footer-left">
      {#if isEditing}
        <button
          class="delete-btn"
          class:confirm={deleteConfirm}
          onclick={handleDelete}
        >
          {deleteConfirm ? 'Confirm delete?' : 'Delete Task'}
        </button>
      {/if}
    </div>
    <div class="footer-right">
      <button class="cancel-btn" onclick={() => tasksStore.closeModal()}>Cancel</button>
      <button class="save-btn" onclick={handleSave} disabled={!title.trim()}>
        {isEditing ? 'Save Changes' : 'Create Task'}
      </button>
    </div>
  {/snippet}
</Modal>

<style>
  .form {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .label {
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .required {
    color: var(--color-accent-danger);
  }

  .input, .textarea, .select {
    padding: var(--space-2) var(--space-3);
    background: var(--color-bg-tertiary);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    color: var(--color-text-primary);
    transition: border-color var(--transition-fast);
    width: 100%;
  }

  .input:focus, .textarea:focus, .select:focus {
    outline: none;
    border-color: var(--color-accent-primary);
  }

  .input::placeholder, .textarea::placeholder {
    color: var(--color-text-tertiary);
  }

  .textarea {
    resize: vertical;
    min-height: 80px;
    font-family: inherit;
  }

  .btn-row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .status-btn, .priority-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    padding: var(--space-1) var(--space-3);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-md);
    font-size: var(--text-xs);
    font-weight: 500;
    color: var(--color-text-secondary);
    transition: all var(--transition-fast);
  }

  .status-btn:hover, .priority-btn:hover {
    border-color: var(--btn-color);
    color: var(--btn-color);
  }

  .status-btn.active, .priority-btn.active {
    border-color: var(--btn-color);
    background: color-mix(in srgb, var(--btn-color) 15%, transparent);
    color: var(--btn-color);
  }

  .date-row {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .date-input {
    flex: 1;
    color-scheme: dark;
  }

  .clear-btn {
    font-size: var(--text-xs);
    color: var(--color-text-tertiary);
    text-decoration: underline;
    white-space: nowrap;
    transition: color var(--transition-fast);
  }

  .clear-btn:hover {
    color: var(--color-text-primary);
  }

  .subtasks {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    background: var(--color-bg-tertiary);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-md);
    padding: var(--space-3);
  }

  .subtask-row {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .subtask-title {
    flex: 1;
    font-size: var(--text-sm);
    color: var(--color-text-primary);
  }

  .subtask-title.done {
    text-decoration: line-through;
    color: var(--color-text-tertiary);
  }

  .subtask-del {
    display: flex;
    align-items: center;
    color: var(--color-text-tertiary);
    opacity: 0;
    transition: opacity var(--transition-fast);
  }

  .subtask-row:hover .subtask-del {
    opacity: 1;
  }

  .subtask-add-row {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-top: var(--space-1);
  }

  .subtask-input {
    flex: 1;
    height: 28px;
    padding: 0 var(--space-2);
    background: var(--color-bg-elevated);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-sm);
    font-size: var(--text-xs);
    color: var(--color-text-primary);
  }

  .subtask-input:focus {
    outline: none;
    border-color: var(--color-accent-primary);
  }

  .subtask-input::placeholder {
    color: var(--color-text-tertiary);
  }

  .subtask-add-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: var(--color-accent-primary);
    color: #fff;
    border-radius: var(--radius-sm);
    transition: background var(--transition-fast), opacity var(--transition-fast);
  }

  .subtask-add-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  /* Footer */
  :global(.modal-footer) {
    justify-content: space-between !important;
  }

  .footer-left {
    display: flex;
    align-items: center;
  }

  .footer-right {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .delete-btn {
    font-size: var(--text-sm);
    color: var(--color-accent-danger);
    font-weight: 500;
    transition: opacity var(--transition-fast);
  }

  .delete-btn.confirm {
    font-weight: 700;
  }

  .cancel-btn {
    padding: var(--space-2) var(--space-4);
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-md);
    transition: background var(--transition-fast);
  }

  .cancel-btn:hover {
    background: var(--color-bg-hover);
  }

  .save-btn {
    padding: var(--space-2) var(--space-5);
    font-size: var(--text-sm);
    font-weight: 600;
    background: var(--color-accent-primary);
    color: #fff;
    border-radius: var(--radius-md);
    transition: background var(--transition-fast), opacity var(--transition-fast);
  }

  .save-btn:hover:not(:disabled) {
    background: var(--color-accent-primary-hover);
  }

  .save-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
</style>
