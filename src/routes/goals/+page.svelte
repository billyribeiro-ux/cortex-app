<script lang="ts">
  import { appStore } from '$lib/stores/app.svelte.js';
  import { goalsStore } from '$lib/stores/goals.svelte.js';
  import GoalFilters from '$lib/components/goals/GoalFilters.svelte';
  import GoalCard from '$lib/components/goals/GoalCard.svelte';
  import GoalDetail from '$lib/components/goals/GoalDetail.svelte';
  import GoalModal from '$lib/components/goals/GoalModal.svelte';
  import GoalStatusSummary from '$lib/components/goals/GoalStatusSummary.svelte';
  import Icon from '@iconify/svelte';

  // Sync TopBar search → goals filter
  $effect(() => {
    goalsStore.setSearchQuery(appStore.searchQuery);
  });

  function handleKeydown(e: KeyboardEvent): void {
    const isMod = e.metaKey || e.ctrlKey;

    if (goalsStore.showCreateModal) return;

    if (isMod && e.key === 'n') {
      e.preventDefault();
      goalsStore.openCreateModal();
    } else if (isMod && e.key === 'f') {
      e.preventDefault();
      document.querySelector<HTMLInputElement>('.filters-bar .search-input')?.focus();
    } else if (isMod && e.key === 'e') {
      e.preventDefault();
      if (goalsStore.activeGoalId) goalsStore.openEditModal(goalsStore.activeGoalId);
    } else if (e.key === 'Escape') {
      if (goalsStore.activeGoalId) {
        goalsStore.setActiveGoal(null);
      }
    }
  }

  const hasAnyGoals = $derived(appStore.goals.length > 0);
  const hasFilteredGoals = $derived(goalsStore.filteredGoals.length > 0);
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="goals-page">
  {#if goalsStore.activeGoal}
    <!-- Detail view -->
    <div class="detail-view">
      <GoalDetail goal={goalsStore.activeGoal} />
    </div>
  {:else}
    <!-- Grid view -->
    <GoalFilters />

    <div class="goals-body">
      {#if !hasAnyGoals}
        <div class="empty-state">
          <Icon icon="ph:target" width={48} height={48} />
          <p>No goals yet.</p>
          <p class="empty-sub">Set your first goal and start tracking progress!</p>
          <button class="cta-btn" onclick={() => goalsStore.openCreateModal()}>
            <Icon icon="ph:plus" width={16} height={16} />
            New Goal
          </button>
        </div>
      {:else}
        {#if appStore.goals.length > 0}
          <div class="summary-row">
            <GoalStatusSummary />
          </div>
        {/if}

        {#if !hasFilteredGoals}
          <div class="empty-state">
            <Icon icon="ph:funnel" width={48} height={48} />
            <p>No goals match your filters.</p>
            <button class="clear-btn" onclick={() => goalsStore.clearFilters()}>Clear filters</button>
          </div>
        {:else}
          <div class="goals-grid">
            {#each goalsStore.filteredGoals as goal (goal.id)}
              <GoalCard
                {goal}
                onclick={() => goalsStore.setActiveGoal(goal.id)}
              />
            {/each}
          </div>
        {/if}
      {/if}
    </div>
  {/if}
</div>

<GoalModal />

<style>
  .goals-page {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    margin: calc(-1 * var(--space-6));
  }

  .detail-view {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .goals-body {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-6);
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  .summary-row {
    flex-shrink: 0;
  }

  .goals-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: var(--space-4);
    align-content: start;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-3);
    flex: 1;
    color: var(--color-text-tertiary);
    text-align: center;
    min-height: 300px;
  }

  .empty-state p {
    font-size: var(--text-base);
    color: var(--color-text-secondary);
  }

  .empty-sub {
    font-size: var(--text-sm);
    color: var(--color-text-tertiary);
  }

  .cta-btn {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-5);
    background: var(--color-accent-primary);
    color: #fff;
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    font-weight: 500;
    transition: background var(--transition-fast);
    margin-top: var(--space-2);
  }

  .cta-btn:hover { background: var(--color-accent-primary-hover); }

  .clear-btn {
    font-size: var(--text-sm);
    color: var(--color-accent-primary);
    text-decoration: underline;
    text-underline-offset: 2px;
  }
</style>
