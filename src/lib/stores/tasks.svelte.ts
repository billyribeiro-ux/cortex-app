import type { Task, Subtask, TaskFilter, TaskStatus, TaskPriority, TaskSortField } from '$lib/types/index.js';
import { TASK_PRIORITY_CONFIG } from '$lib/types/index.js';
import { appStore } from './app.svelte.js';

function createTasksStore() {
  let activeTaskId = $state<string | null>(null);
  let viewMode = $state<'list' | 'board'>('board');
  let showCreateModal = $state<boolean>(false);
  let editingTaskId = $state<string | null>(null);

  let filter = $state<TaskFilter>({
    searchQuery: '',
    status: null,
    priority: null,
    goalId: null,
    tags: [],
    showCompleted: true,
    sortField: 'priority',
    sortDirection: 'asc',
  });

  const activeTask = $derived<Task | null>(
    activeTaskId ? (appStore.tasks.find((t) => t.id === activeTaskId) ?? null) : null
  );

  const editingTask = $derived<Task | null>(
    editingTaskId ? (appStore.tasks.find((t) => t.id === editingTaskId) ?? null) : null
  );

  const filteredTasks = $derived.by<Task[]>(() => {
    let result = appStore.tasks;

    if (!filter.showCompleted) {
      result = result.filter((t) => t.status !== 'done');
    }

    if (filter.searchQuery.trim()) {
      const query = filter.searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    if (filter.status !== null) {
      result = result.filter((t) => t.status === filter.status);
    }

    if (filter.priority !== null) {
      result = result.filter((t) => t.priority === filter.priority);
    }

    if (filter.goalId === 'none') {
      result = result.filter((t) => t.goalId === null);
    } else if (filter.goalId !== null) {
      result = result.filter((t) => t.goalId === filter.goalId);
    }

    if (filter.tags.length > 0) {
      result = result.filter((t) => filter.tags.some((tag) => t.tags.includes(tag)));
    }

    const sorted = [...result].sort((a, b) => {
      const field = filter.sortField;
      let comparison = 0;

      switch (field) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'priority':
          comparison = TASK_PRIORITY_CONFIG[a.priority].order - TASK_PRIORITY_CONFIG[b.priority].order;
          break;
        case 'dueDate': {
          const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
          const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
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

  const tasksByStatus = $derived.by<Record<TaskStatus, Task[]>>(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      'todo': [],
      'in-progress': [],
      'review': [],
      'done': [],
    };
    for (const task of filteredTasks) {
      grouped[task.status].push(task);
    }
    return grouped;
  });

  const allTags = $derived.by<string[]>(() => {
    const tagSet = new Set<string>();
    for (const task of appStore.tasks) {
      for (const tag of task.tags) {
        tagSet.add(tag);
      }
    }
    return [...tagSet].sort();
  });

  const overdueCount = $derived.by<number>(() => {
    const now = new Date();
    return appStore.tasks.filter(
      (t) => t.status !== 'done' && t.dueDate !== null && new Date(t.dueDate) < now
    ).length;
  });

  const statusCounts = $derived.by<Record<TaskStatus, number>>(() => {
    const counts: Record<TaskStatus, number> = { 'todo': 0, 'in-progress': 0, 'review': 0, 'done': 0 };
    for (const task of appStore.tasks) {
      counts[task.status]++;
    }
    return counts;
  });

  return {
    get activeTaskId() { return activeTaskId; },
    get activeTask() { return activeTask; },
    get viewMode() { return viewMode; },
    get showCreateModal() { return showCreateModal; },
    get editingTaskId() { return editingTaskId; },
    get editingTask() { return editingTask; },
    get filter() { return filter; },
    get filteredTasks() { return filteredTasks; },
    get tasksByStatus() { return tasksByStatus; },
    get allTags() { return allTags; },
    get overdueCount() { return overdueCount; },
    get statusCounts() { return statusCounts; },

    set viewMode(mode: 'list' | 'board') { viewMode = mode; },

    setActiveTask(id: string | null): void { activeTaskId = id; },

    openCreateModal(defaultStatus?: TaskStatus): void {
      editingTaskId = null;
      showCreateModal = true;
      if (defaultStatus) {
        filter.status = null;
        // Store default status for the modal to pick up
        activeTaskId = defaultStatus as unknown as string;
      }
    },

    openEditModal(id: string): void {
      editingTaskId = id;
      showCreateModal = true;
    },

    closeModal(): void {
      showCreateModal = false;
      editingTaskId = null;
      activeTaskId = null;
    },

    createTask(data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): string {
      const now = new Date().toISOString();
      const id = crypto.randomUUID();
      const task: Task = { ...data, id, createdAt: now, updatedAt: now };
      appStore.addTask(task);
      return id;
    },

    updateTaskStatus(id: string, status: TaskStatus): void {
      appStore.updateTask(id, { status });
    },

    updateTaskPriority(id: string, priority: TaskPriority): void {
      appStore.updateTask(id, { priority });
    },

    addSubtask(taskId: string, title: string): void {
      const task = appStore.tasks.find((t) => t.id === taskId);
      if (!task) return;
      const subtask: Subtask = {
        id: crypto.randomUUID(),
        title,
        isCompleted: false,
        completedAt: null,
      };
      appStore.updateTask(taskId, { subtasks: [...task.subtasks, subtask] });
    },

    toggleSubtask(taskId: string, subtaskId: string): void {
      const task = appStore.tasks.find((t) => t.id === taskId);
      if (!task) return;
      const updatedSubtasks = task.subtasks.map((s) =>
        s.id === subtaskId
          ? { ...s, isCompleted: !s.isCompleted, completedAt: !s.isCompleted ? new Date().toISOString() : null }
          : s
      );
      appStore.updateTask(taskId, { subtasks: updatedSubtasks });
    },

    removeSubtask(taskId: string, subtaskId: string): void {
      const task = appStore.tasks.find((t) => t.id === taskId);
      if (!task) return;
      appStore.updateTask(taskId, { subtasks: task.subtasks.filter((s) => s.id !== subtaskId) });
    },

    moveToStatus(id: string, status: TaskStatus): void {
      appStore.updateTask(id, { status });
    },

    setSearchQuery(query: string): void { filter.searchQuery = query; },
    setStatusFilter(status: TaskStatus | null): void { filter.status = status; },
    setPriorityFilter(priority: TaskPriority | null): void { filter.priority = priority; },
    setGoalFilter(goalId: string | null): void { filter.goalId = goalId; },
    setShowCompleted(value: boolean): void { filter.showCompleted = value; },
    setSortField(field: TaskSortField): void { filter.sortField = field; },
    toggleSortDirection(): void {
      filter.sortDirection = filter.sortDirection === 'asc' ? 'desc' : 'asc';
    },
    toggleTagFilter(tag: string): void {
      const index = filter.tags.indexOf(tag);
      if (index === -1) { filter.tags.push(tag); } else { filter.tags.splice(index, 1); }
    },
    clearFilters(): void {
      filter.searchQuery = '';
      filter.status = null;
      filter.priority = null;
      filter.goalId = null;
      filter.tags = [];
      filter.showCompleted = true;
      filter.sortField = 'priority';
      filter.sortDirection = 'asc';
    },
  };
}

export const tasksStore = createTasksStore();
