<script lang="ts">
  import type { Goal, Milestone } from '$lib/types/index.js';
  import { GOAL_STATUS_CONFIG, TASK_PRIORITY_CONFIG, TASK_STATUS_CONFIG } from '$lib/types/index.js';
  import { goalsStore } from '$lib/stores/goals.svelte.js';
  import { tasksStore } from '$lib/stores/tasks.svelte.js';
  import { notesStore } from '$lib/stores/notes.svelte.js';
  import { appStore } from '$lib/stores/app.svelte.js';
  import { renderMarkdown } from '$lib/utils/markdown.js';
  import { formatDateForInput, parseDateInput, getRelativeTime } from '$lib/utils/time.js';
  import ProgressRing from '$lib/components/ui/ProgressRing.svelte';
  import GoalTimeline from './GoalTimeline.svelte';
  import LinkTaskDropdown from './LinkTaskDropdown.svelte';
  import Icon from '@iconify/svelte';

  interface Props {
    goal: Goal;
  }

  let { goal }: Props = $props();

  const statusCfg = $derived(GOAL_STATUS_CONFIG[goal.status]);
  const progress = $derived(goalsStore.calculateProgress(goal));
  const linkedTasks = $derived(goalsStore.getLinkedTasks(goal.id));
  const categoryColor = $derived(notesStore.categories.find((c) => c.id === goal.category)?.color ?? '#6c5ce7');
  const categoryName = $derived(notesStore.categories.find((c) => c.id === goal.category)?.name ?? goal.category);
  const renderedDesc = $derived(goal.description ? renderMarkdown(goal.description) : '');
  const sortedMilestones = $derived([...goal.milestones].sort((a, b) => a.order - b.order));

  let newMilestoneTitle = $state('');
  let manualProgress = $state(0);
  let showLinkDropdown = $state(false);
  let dragOverMilestoneId = $state<string | null>(null);
  let draggingMilestoneId = $state<string | null>(null);

  $effect(() => {
    manualProgress = goal.progress;
  });

  function handleAddMilestone(): void {
    const title = newMilestoneTitle.trim();
    if (!title) return;
    goalsStore.addMilestone(goal.id, title);
    newMilestoneTitle = '';
  }

  function handleMilestoneKeydown(e: KeyboardEvent): void {
    if (e.key === 'Enter') { e.preventDefault(); handleAddMilestone(); }
  }

  function handleProgressModeToggle(mode: 'auto' | 'manual'): void {
    appStore.updateGoal(goal.id, { progressMode: mode });
    if (mode === 'auto') goalsStore.syncAutoProgress();
  }

  function handleManualProgressChange(e: Event): void {
    const val = parseInt((e.currentTarget as HTMLInputElement).value, 10);
    manualProgress = val;
    appStore.updateGoal(goal.id, { progress: val, progressMode: 'manual' });
  }

  function handleDragStartMilestone(e: DragEvent, id: string): void {
    draggingMilestoneId = id;
    e.dataTransfer?.setData('text/plain', id);
  }

  function handleDragOverMilestone(e: DragEvent, id: string): void {
    e.preventDefault();
    dragOverMilestoneId = id;
  }

  function handleDropMilestone(e: DragEvent, targetId: string): void {
    e.preventDefault();
    const sourceId = e.dataTransfer?.getData('text/plain');
    if (!sourceId || sourceId === targetId) {
      dragOverMilestoneId = null;
      draggingMilestoneId = null;
      return;
    }
    const ids = sortedMilestones.map((m) => m.id);
    const fromIdx = ids.indexOf(sourceId);
    const toIdx = ids.indexOf(targetId);
    if (fromIdx === -1 || toIdx === -1) return;
    const reordered = [...ids];
    reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, sourceId);
    goalsStore.reorderMilestones(goal.id, reordered);
    dragOverMilestoneId = null;
    draggingMilestoneId = null;
  }

  function handleDragEndMilestone(): void {
    dragOverMilestoneId = null;
    draggingMilestoneId = null;
  }

  function openTaskForGoal(): void {
    tasksStore.openCreateModal();
  }
</script>

<div class="detail-wrap">
  <!-- Header -->
  <div class="detail-header">
    <button class="back-btn" onclick={() => goalsStore.setActiveGoal(null)}>
      <Icon icon="ph:arrow-left" width={16} height={16} />
      Back to Goals
    </button>
    <div class="header-actions">
      <button class="action-btn" onclick={() => goalsStore.openEditModal(goal.id)} title="Edit goal">
        <Icon icon="ph:pencil" width={16} height={16} />
        Edit
      </button>
    </div>
  </div>

  <div class="detail-body">
    <!-- Top section: info + progress -->
    <div class="top-section">
      <div class="goal-info">
        <h1 class="goal-title">{goal.title}</h1>
        <div class="goal-meta">
          <span class="status-badge" style:color={statusCfg.color} style:background="color-mix(in srgb, {statusCfg.color} 12%, transparent)">
            <Icon icon={statusCfg.icon} width={12} height={12} />
            {statusCfg.label}
          </span>
          <span class="meta-sep">·</span>
          <span class="cat-dot" style:background={categoryColor}></span>
          <span class="cat-name">{categoryName}</span>
          {#if goal.targetDate}
            <span class="meta-sep">·</span>
            <Icon icon="ph:calendar" width={12} height={12} />
            <span class="target-date">
              {new Date(goal.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          {/if}
        </div>
        {#if goal.description}
          <div class="goal-desc markdown-preview">
            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
            {@html renderedDesc}
          </div>
        {/if}
      </div>

      <div class="progress-panel">
        <ProgressRing {progress} size={120} strokeWidth={8} color={goal.color} />
        <div class="progress-mode">
          <button
            class="mode-btn"
            class:active={goal.progressMode === 'auto'}
            onclick={() => handleProgressModeToggle('auto')}
          >Auto</button>
          <button
            class="mode-btn"
            class:active={goal.progressMode === 'manual'}
            onclick={() => handleProgressModeToggle('manual')}
          >Manual</button>
        </div>
        {#if goal.progressMode === 'manual'}
          <input
            class="progress-slider"
            type="range"
            min="0"
            max="100"
            value={manualProgress}
            oninput={handleManualProgressChange}
          />
        {:else}
          <div class="auto-breakdown">
            <span>{goal.milestones.filter((m) => m.isCompleted).length}/{goal.milestones.length} milestones</span>
            <span>{linkedTasks.filter((t) => t.status === 'done').length}/{linkedTasks.length} tasks</span>
          </div>
        {/if}
      </div>
    </div>

    <!-- Milestones -->
    <section class="section">
      <h2 class="section-title">
        <Icon icon="ph:flag-checkered" width={16} height={16} />
        Milestones
      </h2>
      <div class="milestones-list">
        {#each sortedMilestones as ms (ms.id)}
          <div
            class="milestone-row"
            class:drag-over={dragOverMilestoneId === ms.id}
            class:dragging={draggingMilestoneId === ms.id}
            draggable="true"
            role="listitem"
            ondragstart={(e) => handleDragStartMilestone(e, ms.id)}
            ondragover={(e) => handleDragOverMilestone(e, ms.id)}
            ondrop={(e) => handleDropMilestone(e, ms.id)}
            ondragend={handleDragEndMilestone}
          >
            <span class="drag-handle">
              <Icon icon="ph:dots-six-vertical" width={14} height={14} />
            </span>
            <input
              type="checkbox"
              checked={ms.isCompleted}
              onchange={() => goalsStore.toggleMilestone(goal.id, ms.id)}
              aria-label="Toggle milestone"
            />
            <span class="ms-title" class:done={ms.isCompleted}>{ms.title}</span>
            {#if ms.targetDate}
              <span class="ms-date">{new Date(ms.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            {/if}
            {#if ms.isCompleted && ms.completedAt}
              <span class="ms-completed">✓ {getRelativeTime(ms.completedAt)}</span>
            {/if}
            <button
              class="ms-delete"
              onclick={() => goalsStore.removeMilestone(goal.id, ms.id)}
              aria-label="Remove milestone"
            >
              <Icon icon="ph:x" width={12} height={12} />
            </button>
          </div>
        {/each}

        <div class="milestone-add-row">
          <input
            class="milestone-input selectable"
            type="text"
            placeholder="Add milestone..."
            bind:value={newMilestoneTitle}
            onkeydown={handleMilestoneKeydown}
          />
          <button
            class="milestone-add-btn"
            onclick={handleAddMilestone}
            disabled={!newMilestoneTitle.trim()}
          >
            <Icon icon="ph:plus" width={14} height={14} />
          </button>
        </div>
      </div>
    </section>

    <!-- Linked Tasks -->
    <section class="section">
      <h2 class="section-title">
        <Icon icon="ph:check-square" width={16} height={16} />
        Linked Tasks
      </h2>
      <div class="tasks-list">
        {#each linkedTasks as task (task.id)}
          {@const priorityCfg = TASK_PRIORITY_CONFIG[task.priority]}
          {@const statusCfg2 = TASK_STATUS_CONFIG[task.status]}
          <button class="task-row" onclick={() => tasksStore.openEditModal(task.id)}>
            <span style:color={statusCfg2.color}><Icon icon={statusCfg2.icon} width={14} height={14} /></span>
            <span style:color={priorityCfg.color}><Icon icon={priorityCfg.icon} width={12} height={12} /></span>
            <span class="task-title" class:done={task.status === 'done'}>{task.title}</span>
          </button>
        {/each}

        {#if linkedTasks.length === 0}
          <p class="empty-tasks">No tasks linked to this goal yet.</p>
        {/if}

        <div class="task-actions">
          <div class="link-task-wrap">
            <button class="link-btn" onclick={(e) => { e.stopPropagation(); showLinkDropdown = !showLinkDropdown; }}>
              <Icon icon="ph:link" width={14} height={14} />
              Link existing task
            </button>
            {#if showLinkDropdown}
              <LinkTaskDropdown goalId={goal.id} onclose={() => { showLinkDropdown = false; }} />
            {/if}
          </div>
          <button class="link-btn" onclick={openTaskForGoal}>
            <Icon icon="ph:plus" width={14} height={14} />
            Create new task
          </button>
        </div>
      </div>
    </section>

    <!-- Timeline -->
    <section class="section">
      <h2 class="section-title">
        <Icon icon="ph:calendar-blank" width={16} height={16} />
        Timeline
      </h2>
      <GoalTimeline {goal} />
    </section>
  </div>
</div>

<style>
  .detail-wrap {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  .detail-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-3) var(--space-6);
    border-bottom: 1px solid var(--color-border-subtle);
    flex-shrink: 0;
    background: var(--color-bg-secondary);
  }

  .back-btn {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
    font-weight: 500;
    transition: color var(--transition-fast);
  }

  .back-btn:hover { color: var(--color-text-primary); }

  .header-actions {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .action-btn {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    padding: var(--space-1) var(--space-3);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-md);
    font-size: var(--text-xs);
    font-weight: 500;
    color: var(--color-text-secondary);
    transition: background var(--transition-fast), color var(--transition-fast);
  }

  .action-btn:hover {
    background: var(--color-bg-hover);
    color: var(--color-text-primary);
  }

  .detail-body {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-6);
    display: flex;
    flex-direction: column;
    gap: var(--space-8);
  }

  .top-section {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: var(--space-8);
    align-items: start;
  }

  .goal-info {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .goal-title {
    font-size: var(--text-2xl);
    font-weight: 700;
    color: var(--color-text-primary);
    letter-spacing: -0.02em;
  }

  .goal-meta {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--text-xs);
    color: var(--color-text-tertiary);
    flex-wrap: wrap;
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px var(--space-2);
    border-radius: var(--radius-sm);
    font-size: var(--text-xs);
    font-weight: 600;
  }

  .meta-sep { opacity: 0.4; }

  .cat-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .cat-name, .target-date { color: var(--color-text-tertiary); }

  .goal-desc {
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
    line-height: 1.6;
    max-height: 120px;
    overflow-y: auto;
  }

  /* Minimal markdown styles for description */
  .goal-desc :global(p) { margin: 0 0 var(--space-2); }
  .goal-desc :global(strong) { font-weight: 700; }
  .goal-desc :global(em) { font-style: italic; }
  .goal-desc :global(code) { font-family: var(--font-mono); font-size: 0.875em; background: var(--color-bg-tertiary); padding: 1px 4px; border-radius: var(--radius-sm); }

  .progress-panel {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-3);
    flex-shrink: 0;
  }

  .progress-mode {
    display: flex;
    background: var(--color-bg-tertiary);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-md);
    overflow: hidden;
  }

  .mode-btn {
    padding: var(--space-1) var(--space-3);
    font-size: var(--text-xs);
    font-weight: 500;
    color: var(--color-text-tertiary);
    transition: background var(--transition-fast), color var(--transition-fast);
  }

  .mode-btn.active {
    background: var(--color-bg-elevated);
    color: var(--color-text-primary);
  }

  .progress-slider {
    width: 120px;
    accent-color: var(--color-accent-primary);
  }

  .auto-breakdown {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-1);
    font-size: var(--text-xs);
    color: var(--color-text-tertiary);
  }

  /* Sections */
  .section {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--text-sm);
    font-weight: 700;
    color: var(--color-text-primary);
    padding-bottom: var(--space-2);
    border-bottom: 1px solid var(--color-border-subtle);
  }

  /* Milestones */
  .milestones-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-lg);
    padding: var(--space-3);
  }

  .milestone-row {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2);
    border-radius: var(--radius-md);
    transition: background var(--transition-fast);
  }

  .milestone-row:hover {
    background: var(--color-bg-hover);
  }

  .milestone-row.drag-over {
    border: 1px dashed var(--color-accent-primary);
    background: rgba(108, 92, 231, 0.05);
  }

  .milestone-row.dragging {
    opacity: 0.4;
  }

  .drag-handle {
    color: var(--color-text-tertiary);
    cursor: grab;
    display: flex;
    align-items: center;
    opacity: 0;
    transition: opacity var(--transition-fast);
  }

  .milestone-row:hover .drag-handle { opacity: 1; }

  .ms-title {
    flex: 1;
    font-size: var(--text-sm);
    color: var(--color-text-primary);
  }

  .ms-title.done {
    text-decoration: line-through;
    color: var(--color-text-tertiary);
  }

  .ms-date {
    font-size: var(--text-xs);
    color: var(--color-text-tertiary);
  }

  .ms-completed {
    font-size: var(--text-xs);
    color: var(--color-accent-success);
  }

  .ms-delete {
    display: flex;
    align-items: center;
    color: var(--color-text-tertiary);
    opacity: 0;
    transition: opacity var(--transition-fast);
  }

  .milestone-row:hover .ms-delete { opacity: 1; }

  .milestone-add-row {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-top: var(--space-2);
    padding-top: var(--space-2);
    border-top: 1px solid var(--color-border-subtle);
  }

  .milestone-input {
    flex: 1;
    height: 30px;
    padding: 0 var(--space-2);
    background: var(--color-bg-tertiary);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-md);
    font-size: var(--text-xs);
    color: var(--color-text-primary);
  }

  .milestone-input:focus {
    outline: none;
    border-color: var(--color-accent-primary);
  }

  .milestone-input::placeholder { color: var(--color-text-tertiary); }

  .milestone-add-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    background: var(--color-accent-primary);
    color: #fff;
    border-radius: var(--radius-md);
    transition: background var(--transition-fast), opacity var(--transition-fast);
  }

  .milestone-add-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  /* Tasks */
  .tasks-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-lg);
    padding: var(--space-3);
  }

  .task-row {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2);
    border-radius: var(--radius-md);
    transition: background var(--transition-fast);
    text-align: left;
    width: 100%;
  }

  .task-row:hover { background: var(--color-bg-hover); }

  .task-title {
    flex: 1;
    font-size: var(--text-sm);
    color: var(--color-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .task-title.done {
    text-decoration: line-through;
    color: var(--color-text-tertiary);
  }

  .empty-tasks {
    font-size: var(--text-xs);
    color: var(--color-text-tertiary);
    padding: var(--space-2);
  }

  .task-actions {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding-top: var(--space-2);
    border-top: 1px solid var(--color-border-subtle);
    margin-top: var(--space-1);
  }

  .link-task-wrap {
    position: relative;
  }

  .link-btn {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    font-size: var(--text-xs);
    color: var(--color-accent-primary);
    font-weight: 500;
    transition: opacity var(--transition-fast);
  }

  .link-btn:hover { opacity: 0.8; }
</style>
