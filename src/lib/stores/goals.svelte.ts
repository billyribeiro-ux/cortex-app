import type { Goal, Milestone, GoalStatus, GoalFilter, GoalSortField, Task } from '$lib/types/index.js';
import { appStore } from './app.svelte.js';

function createGoalsStore() {
  let activeGoalId = $state<string | null>(null);
  let showCreateModal = $state<boolean>(false);
  let editingGoalId = $state<string | null>(null);

  let filter = $state<GoalFilter>({
    searchQuery: '',
    status: null,
    category: null,
    sortField: 'updatedAt',
    sortDirection: 'desc',
  });

  const activeGoal = $derived<Goal | null>(
    activeGoalId ? (appStore.goals.find((g) => g.id === activeGoalId) ?? null) : null
  );

  const editingGoal = $derived<Goal | null>(
    editingGoalId ? (appStore.goals.find((g) => g.id === editingGoalId) ?? null) : null
  );

  const activeGoalTasks = $derived<Task[]>(
    activeGoalId ? appStore.tasks.filter((t) => t.goalId === activeGoalId) : []
  );

  function getLinkedTasks(goalId: string): Task[] {
    return appStore.tasks.filter((t) => t.goalId === goalId);
  }

  function calculateProgress(goal: Goal): number {
    if (goal.progressMode === 'manual') return goal.progress;
    const linkedTasks = getLinkedTasks(goal.id);
    const totalItems = goal.milestones.length + linkedTasks.length;
    if (totalItems === 0) return 0;
    const completedMilestones = goal.milestones.filter((m) => m.isCompleted).length;
    const completedTasks = linkedTasks.filter((t) => t.status === 'done').length;
    return Math.round(((completedMilestones + completedTasks) / totalItems) * 100);
  }

  const filteredGoals = $derived.by<Goal[]>(() => {
    let result = appStore.goals;

    if (filter.searchQuery.trim()) {
      const query = filter.searchQuery.toLowerCase();
      result = result.filter(
        (g) =>
          g.title.toLowerCase().includes(query) ||
          g.description.toLowerCase().includes(query)
      );
    }

    if (filter.status !== null) {
      result = result.filter((g) => g.status === filter.status);
    }

    if (filter.category !== null) {
      result = result.filter((g) => g.category === filter.category);
    }

    const sorted = [...result].sort((a, b) => {
      const field = filter.sortField;
      let comparison = 0;

      switch (field) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'progress':
          comparison = calculateProgress(a) - calculateProgress(b);
          break;
        case 'targetDate': {
          const aDate = a.targetDate ? new Date(a.targetDate).getTime() : Infinity;
          const bDate = b.targetDate ? new Date(b.targetDate).getTime() : Infinity;
          comparison = aDate - bDate;
          break;
        }
        default:
          comparison = new Date(a[field]).getTime() - new Date(b[field]).getTime();
      }

      return filter.sortDirection === 'desc' ? -comparison : comparison;
    });

    return sorted;
  });

  const goalsByStatus = $derived.by<Record<GoalStatus, number>>(() => {
    const counts: Record<GoalStatus, number> = {
      'not-started': 0, 'active': 0, 'paused': 0, 'completed': 0, 'abandoned': 0,
    };
    for (const goal of appStore.goals) {
      counts[goal.status]++;
    }
    return counts;
  });

  function syncAutoProgress(): void {
    for (const goal of appStore.goals) {
      if (goal.progressMode === 'auto') {
        const newProgress = calculateProgress(goal);
        if (goal.progress !== newProgress) {
          appStore.updateGoal(goal.id, { progress: newProgress });
        }
      }
    }
  }

  return {
    get activeGoalId() { return activeGoalId; },
    get activeGoal() { return activeGoal; },
    get activeGoalTasks() { return activeGoalTasks; },
    get showCreateModal() { return showCreateModal; },
    get editingGoalId() { return editingGoalId; },
    get editingGoal() { return editingGoal; },
    get filter() { return filter; },
    get filteredGoals() { return filteredGoals; },
    get goalsByStatus() { return goalsByStatus; },

    getLinkedTasks,
    calculateProgress,

    setActiveGoal(id: string | null): void { activeGoalId = id; },

    openCreateModal(): void {
      editingGoalId = null;
      showCreateModal = true;
    },

    openEditModal(id: string): void {
      editingGoalId = id;
      showCreateModal = true;
    },

    closeModal(): void {
      showCreateModal = false;
      editingGoalId = null;
    },

    createGoal(data: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): string {
      const now = new Date().toISOString();
      const id = crypto.randomUUID();
      const goal: Goal = { ...data, id, createdAt: now, updatedAt: now };
      appStore.addGoal(goal);
      return id;
    },

    addMilestone(goalId: string, title: string, description: string = '', targetDate: string | null = null): void {
      const goal = appStore.goals.find((g) => g.id === goalId);
      if (!goal) return;
      const milestone: Milestone = {
        id: crypto.randomUUID(),
        title,
        description,
        isCompleted: false,
        completedAt: null,
        targetDate,
        order: goal.milestones.length,
      };
      appStore.updateGoal(goalId, { milestones: [...goal.milestones, milestone] });
    },

    toggleMilestone(goalId: string, milestoneId: string): void {
      const goal = appStore.goals.find((g) => g.id === goalId);
      if (!goal) return;
      const updated = goal.milestones.map((m) =>
        m.id === milestoneId
          ? { ...m, isCompleted: !m.isCompleted, completedAt: !m.isCompleted ? new Date().toISOString() : null }
          : m
      );
      appStore.updateGoal(goalId, { milestones: updated });
      syncAutoProgress();
    },

    updateMilestone(goalId: string, milestoneId: string, updates: Partial<Milestone>): void {
      const goal = appStore.goals.find((g) => g.id === goalId);
      if (!goal) return;
      const updated = goal.milestones.map((m) =>
        m.id === milestoneId ? { ...m, ...updates } : m
      );
      appStore.updateGoal(goalId, { milestones: updated });
    },

    removeMilestone(goalId: string, milestoneId: string): void {
      const goal = appStore.goals.find((g) => g.id === goalId);
      if (!goal) return;
      appStore.updateGoal(goalId, { milestones: goal.milestones.filter((m) => m.id !== milestoneId) });
    },

    reorderMilestones(goalId: string, milestoneIds: string[]): void {
      const goal = appStore.goals.find((g) => g.id === goalId);
      if (!goal) return;
      const reordered = milestoneIds
        .map((id, index) => {
          const ms = goal.milestones.find((m) => m.id === id);
          return ms ? { ...ms, order: index } : null;
        })
        .filter((m): m is Milestone => m !== null);
      appStore.updateGoal(goalId, { milestones: reordered });
    },

    updateStatus(id: string, status: GoalStatus): void {
      appStore.updateGoal(id, { status });
      syncAutoProgress();
    },

    syncAutoProgress,

    setSearchQuery(query: string): void { filter.searchQuery = query; },
    setStatusFilter(status: GoalStatus | null): void { filter.status = status; },
    setCategoryFilter(category: string | null): void { filter.category = category; },
    setSortField(field: GoalSortField): void { filter.sortField = field; },
    toggleSortDirection(): void {
      filter.sortDirection = filter.sortDirection === 'asc' ? 'desc' : 'asc';
    },
    clearFilters(): void {
      filter.searchQuery = '';
      filter.status = null;
      filter.category = null;
      filter.sortField = 'updatedAt';
      filter.sortDirection = 'desc';
    },
  };
}

export const goalsStore = createGoalsStore();
