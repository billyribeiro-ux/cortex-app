<script lang="ts">
  import type { Goal, GoalStatus, Milestone } from '$lib/types/index.js';
  import { GOAL_STATUS_CONFIG, GOAL_COLORS } from '$lib/types/index.js';
  import { goalsStore } from '$lib/stores/goals.svelte.js';
  import { appStore } from '$lib/stores/app.svelte.js';
  import { notesStore } from '$lib/stores/notes.svelte.js';
  import { toastStore } from '$lib/stores/toast.svelte.js';
  import { formatDateForInput, parseDateInput } from '$lib/utils/time.js';
  import Modal from '$lib/components/ui/Modal.svelte';
  import Icon from '@iconify/svelte';

  const isEditing = $derived(goalsStore.editingGoal !== null);
  const goal = $derived(goalsStore.editingGoal);

  let title = $state('');
  let description = $state('');
  let status = $state<GoalStatus>('not-started');
  let category = $state('general');
  let color = $state(GOAL_COLORS[0] ?? '#6c5ce7');
  let startDate = $state(new Date().toISOString().split('T')[0] ?? '');
  let targetDate = $state('');
  let progressMode = $state<'auto' | 'manual'>('auto');
  let manualProgress = $state(0);
  let milestones = $state<Milestone[]>([]);
  let newMilestoneTitle = $state('');
  let deleteConfirm = $state(false);
  let titleInputEl = $state<HTMLInputElement | null>(null);
  let titleError = $state('');

  $effect(() => {
    if (goalsStore.showCreateModal) {
      if (goal) {
        title = goal.title;
        description = goal.description;
        status = goal.status;
        category = goal.category;
        color = goal.color;
        startDate = formatDateForInput(goal.startDate);
        targetDate = formatDateForInput(goal.targetDate);
        progressMode = goal.progressMode;
        manualProgress = goal.progress;
        milestones = (goal.milestones ?? []).map((m) => ({ ...m }));
      } else {
        title = '';
        description = '';
        status = 'not-started';
        category = 'general';
        color = GOAL_COLORS[0] ?? '#6c5ce7';
        startDate = new Date().toISOString().split('T')[0] ?? '';
        targetDate = '';
        progressMode = 'auto';
        manualProgress = 0;
        milestones = [];
      }
      deleteConfirm = false;
      titleError = '';
      setTimeout(() => titleInputEl?.focus(), 50);
    }
  });

  function addMilestone(): void {
    const t = newMilestoneTitle.trim();
    if (!t) return;
    milestones.push({
      id: crypto.randomUUID(),
      title: t,
      description: '',
      isCompleted: false,
      completedAt: null,
      targetDate: null,
      order: milestones.length,
    });
    newMilestoneTitle = '';
  }

  function removeMilestone(id: string): void {
    milestones = milestones
      .filter((m) => m.id !== id)
      .map((m, i) => ({ ...m, order: i }));
  }

  function handleMilestoneKeydown(e: KeyboardEvent): void {
    if (e.key === 'Enter') { e.preventDefault(); addMilestone(); }
  }

  function handleSave(): void {
    if (!title.trim()) {
      titleError = 'Title is required';
      titleInputEl?.focus();
      return;
    }
    titleError = '';

    const data: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'> = {
      title: title.trim(),
      description: description.trim(),
      status,
      category,
      color,
      startDate: parseDateInput(startDate) ?? new Date().toISOString(),
      targetDate: parseDateInput(targetDate),
      progressMode,
      progress: progressMode === 'manual' ? manualProgress : 0,
      milestones,
    };

    const editingId = goalsStore.editingGoalId;
    if (isEditing && editingId) {
      appStore.updateGoal(editingId, data);
      toastStore.success('Goal updated');
    } else {
      goalsStore.createGoal(data);
      toastStore.success('Goal created');
    }
    goalsStore.closeModal();
  }

  function handleDelete(): void {
    if (!deleteConfirm) {
      deleteConfirm = true;
      setTimeout(() => { deleteConfirm = false; }, 3000);
      return;
    }
    const editingId = goalsStore.editingGoalId;
    if (editingId) {
      appStore.deleteGoal(editingId);
      toastStore.success('Goal deleted');
      if (goalsStore.activeGoalId === editingId) {
        goalsStore.setActiveGoal(null);
      }
    }
    goalsStore.closeModal();
  }

  const componentId = $props.id();
  const titleId = `${componentId}-title`;
  const descId = `${componentId}-desc`;
  const startId = `${componentId}-start`;
  const targetId = `${componentId}-target`;
</script>

<Modal
  open={goalsStore.showCreateModal}
  onclose={() => goalsStore.closeModal()}
  title={isEditing ? 'Edit Goal' : 'New Goal'}
  footerAlign="between"
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
          class:input-error={!!titleError}
          type="text"
          placeholder="Goal title..."
          bind:value={title}
          oninput={() => { titleError = ''; }}
          aria-required="true"
          aria-invalid={!!titleError}
        />
        {#if titleError}
          <span class="field-error">{titleError}</span>
        {/if}
      </div>

      <!-- Description -->
      <div class="field">
        <label for={descId} class="label">Description</label>
        <textarea
          id={descId}
          class="textarea selectable"
          placeholder="Describe your goal... (supports markdown)"
          bind:value={description}
          rows={4}
        ></textarea>
      </div>

      <!-- Status -->
      <div class="field">
        <span class="label">Status</span>
        <div class="btn-row">
          {#each Object.entries(GOAL_STATUS_CONFIG) as [key, cfg]}
            <button
              class="status-btn"
              class:active={status === key}
              style:--btn-color={cfg.color}
              onclick={() => { status = key as GoalStatus; }}
            >
              <Icon icon={cfg.icon} width={12} height={12} />
              {cfg.label}
            </button>
          {/each}
        </div>
      </div>

      <!-- Category -->
      <div class="field">
        <span class="label">Category</span>
        <div class="cat-pills">
          {#each notesStore.categories as cat}
            <button
              class="cat-pill"
              class:active={category === cat.id}
              style:--cat-color={cat.color}
              onclick={() => { category = cat.id; }}
            >{cat.name}</button>
          {/each}
        </div>
      </div>

      <!-- Color -->
      <div class="field">
        <span class="label">Color</span>
        <div class="color-swatches">
          {#each GOAL_COLORS as c}
            <button
              class="swatch"
              class:selected={color === c}
              style:background={c}
              onclick={() => { color = c; }}
              aria-label="Select color {c}"
            >
              {#if color === c}
                <Icon icon="ph:check-bold" width={12} height={12} />
              {/if}
            </button>
          {/each}
        </div>
      </div>

      <!-- Dates -->
      <div class="date-row">
        <div class="field">
          <label for={startId} class="label">Start Date</label>
          <input id={startId} class="input date-input selectable" type="date" bind:value={startDate} />
        </div>
        <div class="field">
          <label for={targetId} class="label">Target Date</label>
          <div class="date-with-clear">
            <input id={targetId} class="input date-input selectable" type="date" bind:value={targetDate} />
            {#if targetDate}
              <button class="clear-btn" onclick={() => { targetDate = ''; }}>Clear</button>
            {/if}
          </div>
        </div>
      </div>

      <!-- Progress Mode -->
      <div class="field">
        <span class="label">Progress Mode</span>
        <div class="mode-toggle">
          <button
            class="mode-btn"
            class:active={progressMode === 'auto'}
            onclick={() => { progressMode = 'auto'; }}
          >Auto (from milestones & tasks)</button>
          <button
            class="mode-btn"
            class:active={progressMode === 'manual'}
            onclick={() => { progressMode = 'manual'; }}
          >Manual</button>
        </div>
        {#if progressMode === 'manual'}
          <div class="manual-progress">
            <input
              class="progress-slider"
              type="range"
              min="0"
              max="100"
              bind:value={manualProgress}
            />
            <span class="progress-val">{manualProgress}%</span>
          </div>
        {/if}
      </div>

      <!-- Milestones -->
      <div class="field">
        <span class="label">Milestones</span>
        <div class="milestones-editor">
          {#each milestones as ms (ms.id)}
            <div class="ms-row">
              <span class="ms-order">{ms.order + 1}.</span>
              <input
                class="ms-input selectable"
                type="text"
                bind:value={ms.title}
                placeholder="Milestone title..."
              />
              <button class="ms-del" onclick={() => removeMilestone(ms.id)} aria-label="Remove">
                <Icon icon="ph:x" width={12} height={12} />
              </button>
            </div>
          {/each}
          <div class="ms-add-row">
            <input
              class="ms-input selectable"
              type="text"
              placeholder="Add milestone..."
              bind:value={newMilestoneTitle}
              onkeydown={handleMilestoneKeydown}
            />
            <button class="ms-add-btn" onclick={addMilestone} disabled={!newMilestoneTitle.trim()}>
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
          aria-label={deleteConfirm ? 'Click again to confirm delete' : 'Delete goal'}
        >
          {deleteConfirm ? 'Click again to confirm' : 'Delete Goal'}
        </button>
      {/if}
    </div>
    <div class="footer-right">
      <button class="cancel-btn" onclick={() => goalsStore.closeModal()}>Cancel</button>
      <button class="save-btn" onclick={handleSave} disabled={!title.trim()}>
        {isEditing ? 'Save Changes' : 'Create Goal'}
      </button>
    </div>
  {/snippet}
</Modal>

<style>
  .form {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .label {
    font-size: var(--text-xs);
    font-weight: var(--weight-semibold);
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: var(--tracking-xs);
  }

  .required { color: var(--color-accent-danger); }

  .input, .textarea {
    padding: var(--space-2) var(--space-3);
    background: var(--color-bg-tertiary);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    color: var(--color-text-primary);
    height: 36px;
    transition:
      border-color var(--transition-fast),
      box-shadow var(--transition-fast);
    width: 100%;
  }

  .input:focus, .textarea:focus {
    outline: none;
    border-color: var(--color-accent-primary);
    box-shadow: var(--shadow-glow);
  }

  .input::placeholder, .textarea::placeholder { color: var(--color-text-tertiary); }

  .textarea {
    resize: vertical;
    min-height: 80px;
    height: auto;
    font-family: inherit;
  }

  .btn-row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .status-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    padding: var(--space-1) var(--space-3);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-md);
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    color: var(--color-text-secondary);
    transition:
      border-color var(--transition-fast),
      background var(--transition-fast),
      color var(--transition-fast);
  }

  .status-btn:hover {
    border-color: var(--btn-color);
    color: var(--btn-color);
  }

  .status-btn.active {
    border-color: var(--btn-color);
    background: color-mix(in srgb, var(--btn-color) 15%, transparent);
    color: var(--btn-color);
  }

  .cat-pills {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1-5);
  }

  .cat-pill {
    padding: var(--space-1) var(--space-3);
    border-radius: var(--radius-full);
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    min-height: 28px;
    display: inline-flex;
    align-items: center;
    border: 1px solid var(--cat-color, var(--color-accent-primary));
    color: var(--cat-color, var(--color-accent-primary));
    background: transparent;
    opacity: 0.6;
    transition:
      opacity var(--transition-fast),
      background var(--transition-fast);
  }

  .cat-pill:hover { opacity: 0.9; }

  .cat-pill.active {
    background: color-mix(in srgb, var(--cat-color, var(--color-accent-primary)) 20%, transparent);
    opacity: 1;
  }

  .color-swatches {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .swatch {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    transition:
      transform var(--transition-fast),
      box-shadow var(--transition-fast);
    border: 2px solid transparent;
  }

  .swatch:hover { transform: scale(1.15); }

  .swatch.selected {
    border-color: #fff;
    box-shadow: var(--shadow-glow);
  }

  .date-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-4);
  }

  .date-input { color-scheme: dark; }

  .date-with-clear {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .date-with-clear .input { flex: 1; }

  .clear-btn {
    font-size: var(--text-xs);
    color: var(--color-text-tertiary);
    text-decoration: underline;
    white-space: nowrap;
    transition: color var(--transition-fast);
  }

  .clear-btn:hover {
    color: var(--color-text-secondary);
  }

  .mode-toggle {
    display: flex;
    background: var(--color-bg-tertiary);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-md);
    padding: 2px;
    gap: 2px;
  }

  .mode-btn {
    flex: 1;
    padding: var(--space-2) var(--space-3);
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    color: var(--color-text-tertiary);
    border-radius: var(--radius-sm);
    transition:
      background var(--transition-fast),
      color var(--transition-fast),
      box-shadow var(--transition-fast);
    text-align: center;
  }

  .mode-btn.active {
    background: var(--color-bg-elevated);
    color: var(--color-text-primary);
    box-shadow: var(--shadow-xs);
  }

  .manual-progress {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    margin-top: var(--space-2);
  }

  .progress-slider {
    flex: 1;
    accent-color: var(--color-accent-primary);
  }

  .progress-val {
    font-size: var(--text-sm);
    font-weight: var(--weight-semibold);
    color: var(--color-accent-primary);
    min-width: 36px;
    text-align: right;
  }

  .milestones-editor {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    background: var(--color-bg-tertiary);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-lg);
    padding: var(--space-3);
  }

  .ms-row {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .ms-order {
    font-size: var(--text-xs);
    color: var(--color-text-tertiary);
    min-width: 16px;
    letter-spacing: var(--tracking-xs);
  }

  .ms-input {
    flex: 1;
    height: 32px;
    padding: 0 var(--space-2);
    background: var(--color-bg-elevated);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-sm);
    font-size: var(--text-xs);
    color: var(--color-text-primary);
    transition:
      border-color var(--transition-fast),
      box-shadow var(--transition-fast);
  }

  .ms-input:focus {
    outline: none;
    border-color: var(--color-accent-primary);
    box-shadow: var(--shadow-glow);
  }

  .ms-input::placeholder { color: var(--color-text-tertiary); }

  .ms-del {
    display: flex;
    align-items: center;
    color: var(--color-text-tertiary);
    border-radius: var(--radius-xs);
    padding: 2px;
    transition: color var(--transition-fast);
  }

  .ms-del:hover { color: var(--color-accent-danger); }

  .ms-add-row {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding-top: var(--space-2);
    border-top: 1px solid var(--color-border-subtle);
  }

  .ms-add-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: var(--color-accent-primary);
    color: #fff;
    border-radius: var(--radius-sm);
    transition:
      background var(--transition-fast),
      opacity var(--transition-fast),
      transform var(--transition-fast);
  }

  .ms-add-btn:hover:not(:disabled) {
    background: var(--color-accent-primary-hover);
  }

  .ms-add-btn:active:not(:disabled) {
    transform: scale(0.95);
  }

  .ms-add-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .input-error {
    border-color: var(--color-accent-danger) !important;
    box-shadow: 0 0 0 3px var(--color-accent-danger-muted) !important;
  }

  .field-error {
    font-size: var(--text-xs);
    color: var(--color-accent-danger);
    font-weight: var(--weight-medium);
  }

  .footer-left { display: flex; align-items: center; }
  .footer-right { display: flex; align-items: center; gap: var(--space-3); }

  .delete-btn {
    font-size: var(--text-sm);
    color: var(--color-accent-danger);
    font-weight: var(--weight-medium);
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-md);
    transition:
      background var(--transition-fast),
      color var(--transition-fast);
  }

  .delete-btn:hover {
    background: var(--color-accent-danger-muted);
  }

  .delete-btn.confirm {
    font-weight: var(--weight-bold);
    background: var(--color-accent-danger-muted);
  }

  .cancel-btn {
    padding: var(--space-2) var(--space-4);
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
    color: var(--color-text-secondary);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-md);
    min-height: 36px;
    transition:
      background var(--transition-fast),
      border-color var(--transition-fast);
  }

  .cancel-btn:hover {
    background: var(--color-bg-hover);
    border-color: var(--color-border-strong);
  }

  .cancel-btn:active {
    transform: scale(0.97);
    transition: transform 0.1s var(--ease-out);
  }

  .save-btn {
    padding: var(--space-2) var(--space-5);
    font-size: var(--text-sm);
    font-weight: var(--weight-semibold);
    background: var(--color-accent-primary);
    color: #fff;
    border-radius: var(--radius-md);
    min-height: 36px;
    transition:
      background var(--transition-fast),
      opacity var(--transition-fast),
      transform var(--transition-fast);
  }

  .save-btn:hover:not(:disabled) { background: var(--color-accent-primary-hover); }

  .save-btn:active:not(:disabled) {
    transform: scale(0.97);
    transition: transform 0.1s var(--ease-out);
  }

  .save-btn:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
