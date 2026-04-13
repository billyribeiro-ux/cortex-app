<script lang="ts">
  import { appStore } from '$lib/stores/app.svelte.js';
  import { goalsStore } from '$lib/stores/goals.svelte.js';
  import GoalFilters from '$lib/components/goals/GoalFilters.svelte';
  import GoalCard from '$lib/components/goals/GoalCard.svelte';
  import GoalDetail from '$lib/components/goals/GoalDetail.svelte';
  import GoalModal from '$lib/components/goals/GoalModal.svelte';
  import GoalStatusSummary from '$lib/components/goals/GoalStatusSummary.svelte';
  import Icon from '@iconify/svelte';
  import { fly } from 'svelte/transition';

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
        <div class="empty-state" in:fly={{ y: 20, duration: 400, delay: 100 }}>
          <div class="empty-icon-wrap">
            <Icon icon="ph:target" width={48} height={48} />
          </div>
          <div class="empty-text">
            <h3>No goals yet</h3>
            <p class="empty-sub">Set your first goal and start tracking progress!</p>
          </div>
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
          <div class="empty-state" in:fly={{ y: 20, duration: 400 }}>
            <div class="empty-icon-wrap">
              <Icon icon="ph:funnel" width={48} height={48} />
            </div>
            <div class="empty-text">
              <h3>No goals found</h3>
              <p class="empty-sub">Try adjusting your filters or search query.</p>
            </div>
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
    flex: 1;
    overflow: hidden;
    margin: calc(-1 * var(--space-8));
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
    gap: var(--space-5);
    align-content: start;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-6);
    flex: 1;
    text-align: center;
    min-height: 300px;
  }

  .empty-icon-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    border-radius: var(--radius-full);
    background: var(--color-bg-tertiary);
    color: var(--color-text-tertiary);
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
  }

  .empty-text {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .empty-text h3 {
    font-size: var(--text-lg);
    font-weight: var(--weight-semibold);
    color: var(--color-text-primary);
    margin: 0;
  }

  .empty-sub {
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
    max-width: 300px;
    line-height: var(--leading-base);
  }

  .cta-btn {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-5);
    min-height: 44px;
    background: var(--color-accent-primary);
    color: #fff;
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    font-weight: var(--weight-semibold);
    letter-spacing: var(--tracking-sm);
    box-shadow: var(--shadow-sm);
    transition: background var(--transition-fast), box-shadow var(--transition-fast), transform var(--transition-fast);
    margin-top: var(--space-2);
  }

  .cta-btn:hover {
    background: var(--color-accent-primary-hover);
    box-shadow: var(--shadow-md);
  }

  .cta-btn:active {
    transform: scale(0.97);
    box-shadow: var(--shadow-xs);
  }

  .clear-btn {
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
    letter-spacing: var(--tracking-sm);
    color: var(--color-accent-primary);
    text-decoration: underline;
    text-underline-offset: 3px;
    transition: opacity var(--transition-fast);
  }

  .clear-btn:hover {
    opacity: 0.8;
  }
</style>
