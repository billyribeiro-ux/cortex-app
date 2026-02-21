export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
}

export interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
  completedAt: string | null;
}

export type TaskPriority = 'urgent' | 'high' | 'normal' | 'low';
export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';
export type TaskViewMode = 'list' | 'board';
export type TaskSortField = 'updatedAt' | 'createdAt' | 'title' | 'priority' | 'dueDate';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string | null;
  goalId: string | null;
  subtasks: Subtask[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskFilter {
  searchQuery: string;
  status: TaskStatus | null;
  priority: TaskPriority | null;
  goalId: string | null;
  tags: string[];
  showCompleted: boolean;
  sortField: TaskSortField;
  sortDirection: SortDirection;
}

export const TASK_STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; icon: string }> = {
  'todo': { label: 'To Do', color: '#a0a0a8', icon: 'ph:circle-dashed' },
  'in-progress': { label: 'In Progress', color: '#6c5ce7', icon: 'ph:circle-half' },
  'review': { label: 'Review', color: '#fdcb6e', icon: 'ph:eye' },
  'done': { label: 'Done', color: '#00b894', icon: 'ph:check-circle-fill' },
};

export const TASK_PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; icon: string; order: number }> = {
  'urgent': { label: 'Urgent', color: '#e17055', icon: 'ph:fire-fill', order: 0 },
  'high': { label: 'High', color: '#fdcb6e', icon: 'ph:arrow-up-bold', order: 1 },
  'normal': { label: 'Normal', color: '#a0a0a8', icon: 'ph:minus-bold', order: 2 },
  'low': { label: 'Low', color: '#6e6e78', icon: 'ph:arrow-down-bold', order: 3 },
};

export interface Milestone {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  completedAt: string | null;
  targetDate: string | null;
  order: number;
}

export type GoalStatus = 'not-started' | 'active' | 'paused' | 'completed' | 'abandoned';
export type GoalSortField = 'updatedAt' | 'createdAt' | 'title' | 'targetDate' | 'progress';

export interface Goal {
  id: string;
  title: string;
  description: string;
  status: GoalStatus;
  category: string;
  targetDate: string | null;
  startDate: string;
  progress: number;
  progressMode: 'auto' | 'manual';
  milestones: Milestone[];
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface GoalFilter {
  searchQuery: string;
  status: GoalStatus | null;
  category: string | null;
  sortField: GoalSortField;
  sortDirection: SortDirection;
}

export const GOAL_STATUS_CONFIG: Record<GoalStatus, { label: string; color: string; icon: string }> = {
  'not-started': { label: 'Not Started', color: '#6e6e78', icon: 'ph:circle-dashed' },
  'active': { label: 'Active', color: '#6c5ce7', icon: 'ph:play-circle-fill' },
  'paused': { label: 'Paused', color: '#fdcb6e', icon: 'ph:pause-circle-fill' },
  'completed': { label: 'Completed', color: '#00b894', icon: 'ph:check-circle-fill' },
  'abandoned': { label: 'Abandoned', color: '#e17055', icon: 'ph:x-circle-fill' },
};

export const GOAL_COLORS: string[] = [
  '#6c5ce7', '#00b894', '#00cec9', '#0984e3', '#e17055',
  '#fdcb6e', '#e84393', '#d63031', '#a29bfe', '#55a3e8',
];

export type ActiveView = 'dashboard' | 'notes' | 'tasks' | 'goals';

export interface AppState {
  activeView: ActiveView;
  sidebarCollapsed: boolean;
  searchQuery: string;
}

export interface NoteCategory {
  id: string;
  name: string;
  color: string;
}

export const DEFAULT_CATEGORIES: NoteCategory[] = [
  { id: 'sveltekit', name: 'SvelteKit', color: '#ff3e00' },
  { id: 'rust', name: 'Rust', color: '#dea584' },
  { id: 'typescript', name: 'TypeScript', color: '#3178c6' },
  { id: 'python', name: 'Python', color: '#3776ab' },
  { id: 'pine-script', name: 'Pine Script', color: '#2962ff' },
  { id: 'thinkscript', name: 'ThinkScript', color: '#e535ab' },
  { id: 'general', name: 'General', color: '#6c5ce7' },
  { id: 'trading', name: 'Trading', color: '#00b894' },
  { id: 'devops', name: 'DevOps', color: '#fdcb6e' },
  { id: 'databases', name: 'Databases', color: '#e17055' },
];

export type NoteSortField = 'updatedAt' | 'createdAt' | 'title';
export type SortDirection = 'asc' | 'desc';

export interface NoteFilter {
  searchQuery: string;
  category: string | null;
  tags: string[];
  favoritesOnly: boolean;
  sortField: NoteSortField;
  sortDirection: SortDirection;
}

export interface ClaudeMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
