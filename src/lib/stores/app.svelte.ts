import type { Note, Task, Goal, AppState } from '$lib/types/index.js';
import { loadFromStorage, saveToStorage } from '$lib/utils/local-storage.js';

function createAppStore() {
  let notes = $state<Note[]>(loadFromStorage('cortex:notes', []));
  let tasks = $state<Task[]>(loadFromStorage('cortex:tasks', []));
  let goals = $state<Goal[]>(loadFromStorage('cortex:goals', []));
  let activeView = $state<AppState['activeView']>('dashboard');
  let sidebarCollapsed = $state<boolean>(loadFromStorage('cortex:sidebar-collapsed', false));
  let searchQuery = $state<string>('');

  // Derived counts
  const noteCount = $derived(notes.length);
  const openTaskCount = $derived(tasks.filter((t) => t.status !== 'done').length);
  const activeGoalCount = $derived(goals.filter((g) => g.progress < 100).length);

  // Persistence effects — save to localStorage on change
  $effect(() => {
    saveToStorage('cortex:notes', notes);
  });

  $effect(() => {
    saveToStorage('cortex:tasks', tasks);
  });

  $effect(() => {
    saveToStorage('cortex:goals', goals);
  });

  $effect(() => {
    saveToStorage('cortex:sidebar-collapsed', sidebarCollapsed);
  });

  return {
    // State (getters for reading, since we can't export reassigned $state)
    get notes() { return notes; },
    get tasks() { return tasks; },
    get goals() { return goals; },
    get activeView() { return activeView; },
    get sidebarCollapsed() { return sidebarCollapsed; },
    get searchQuery() { return searchQuery; },

    // Derived
    get noteCount() { return noteCount; },
    get openTaskCount() { return openTaskCount; },
    get activeGoalCount() { return activeGoalCount; },

    // Setters
    set activeView(view: AppState['activeView']) { activeView = view; },
    set sidebarCollapsed(value: boolean) { sidebarCollapsed = value; },
    set searchQuery(value: string) { searchQuery = value; },

    // Note mutations
    addNote(note: Note): void { notes.push(note); },
    updateNote(id: string, updates: Partial<Note>): void {
      const index = notes.findIndex((n) => n.id === id);
      if (index !== -1) {
        notes[index] = { ...notes[index]!, ...updates, updatedAt: new Date().toISOString() };
      }
    },
    deleteNote(id: string): void {
      notes = notes.filter((n) => n.id !== id);
    },

    // Task mutations
    addTask(task: Task): void { tasks.push(task); },
    updateTask(id: string, updates: Partial<Task>): void {
      const index = tasks.findIndex((t) => t.id === id);
      if (index !== -1) {
        tasks[index] = { ...tasks[index]!, ...updates, updatedAt: new Date().toISOString() };
      }
    },
    deleteTask(id: string): void {
      tasks = tasks.filter((t) => t.id !== id);
    },

    // Goal mutations
    addGoal(goal: Goal): void { goals.push(goal); },
    updateGoal(id: string, updates: Partial<Goal>): void {
      const index = goals.findIndex((g) => g.id === id);
      if (index !== -1) {
        goals[index] = { ...goals[index]!, ...updates, updatedAt: new Date().toISOString() };
      }
    },
    deleteGoal(id: string): void {
      goals = goals.filter((g) => g.id !== id);
    }
  };
}

export const appStore = createAppStore();
