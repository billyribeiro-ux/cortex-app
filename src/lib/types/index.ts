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
  'todo': { label: 'To Do', color: '#9d9da7', icon: 'ph:circle-dashed' },
  'in-progress': { label: 'In Progress', color: '#786cf5', icon: 'ph:circle-half' },
  'review': { label: 'Review', color: '#f0c45a', icon: 'ph:eye' },
  'done': { label: 'Done', color: '#34c48e', icon: 'ph:check-circle-fill' },
};

export const TASK_PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; icon: string; order: number }> = {
  'urgent': { label: 'Urgent', color: '#e8614d', icon: 'ph:fire-fill', order: 0 },
  'high': { label: 'High', color: '#f0c45a', icon: 'ph:arrow-up-bold', order: 1 },
  'normal': { label: 'Normal', color: '#9d9da7', icon: 'ph:minus-bold', order: 2 },
  'low': { label: 'Low', color: '#636370', icon: 'ph:arrow-down-bold', order: 3 },
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
  'not-started': { label: 'Not Started', color: '#636370', icon: 'ph:circle-dashed' },
  'active': { label: 'Active', color: '#786cf5', icon: 'ph:play-circle-fill' },
  'paused': { label: 'Paused', color: '#f0c45a', icon: 'ph:pause-circle-fill' },
  'completed': { label: 'Completed', color: '#34c48e', icon: 'ph:check-circle-fill' },
  'abandoned': { label: 'Abandoned', color: '#e8614d', icon: 'ph:x-circle-fill' },
};

export const GOAL_COLORS: string[] = [
  '#786cf5', '#34c48e', '#2ac9c4', '#4a9eff', '#e8614d',
  '#f0c45a', '#e05490', '#d63031', '#a29bfe', '#5aabf0',
];

export type ActiveView =
  | 'dashboard'
  | 'notes'
  | 'tasks'
  | 'goals'
  | 'prompts'
  | 'stacks'
  | 'github'
  | 'terminal'
  | 'vercel'
  | 'pnpm'
  | 'snippets'
  | 'supabase'
  | 'rust'
  | 'dev';

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

export interface Prompt {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
}

export type PromptSortField = 'updatedAt' | 'createdAt' | 'title';

export interface PromptFilter {
  searchQuery: string;
  tags: string[];
  favoritesOnly: boolean;
  sortField: PromptSortField;
  sortDirection: SortDirection;
}

export interface Stack {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
}

export type StackSortField = 'updatedAt' | 'createdAt' | 'title';

export interface StackFilter {
  searchQuery: string;
  tags: string[];
  favoritesOnly: boolean;
  sortField: StackSortField;
  sortDirection: SortDirection;
}

export interface GithubItem {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
}

export type GithubSortField = 'updatedAt' | 'createdAt' | 'title';

export interface GithubFilter {
  searchQuery: string;
  tags: string[];
  favoritesOnly: boolean;
  sortField: GithubSortField;
  sortDirection: SortDirection;
}

export interface TerminalItem {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
}

export type TerminalSortField = 'updatedAt' | 'createdAt' | 'title';

export interface TerminalFilter {
  searchQuery: string;
  tags: string[];
  favoritesOnly: boolean;
  sortField: TerminalSortField;
  sortDirection: SortDirection;
}

export interface VercelItem {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
}

export type VercelSortField = 'updatedAt' | 'createdAt' | 'title';

export interface VercelFilter {
  searchQuery: string;
  tags: string[];
  favoritesOnly: boolean;
  sortField: VercelSortField;
  sortDirection: SortDirection;
}

export interface PnpmItem {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
}

export type PnpmSortField = 'updatedAt' | 'createdAt' | 'title';

export interface PnpmFilter {
  searchQuery: string;
  tags: string[];
  favoritesOnly: boolean;
  sortField: PnpmSortField;
  sortDirection: SortDirection;
}

export interface SnippetItem {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
}

export type SnippetSortField = 'updatedAt' | 'createdAt' | 'title';

export interface SnippetFilter {
  searchQuery: string;
  tags: string[];
  favoritesOnly: boolean;
  sortField: SnippetSortField;
  sortDirection: SortDirection;
}

export interface SupabaseItem {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
}

export type SupabaseSortField = 'updatedAt' | 'createdAt' | 'title';

export interface SupabaseFilter {
  searchQuery: string;
  tags: string[];
  favoritesOnly: boolean;
  sortField: SupabaseSortField;
  sortDirection: SortDirection;
}

export interface RustItem {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
}

export type RustSortField = 'updatedAt' | 'createdAt' | 'title';

export interface RustFilter {
  searchQuery: string;
  tags: string[];
  favoritesOnly: boolean;
  sortField: RustSortField;
  sortDirection: SortDirection;
}

export interface DevItem {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
}

export type DevSortField = 'updatedAt' | 'createdAt' | 'title';

export interface DevFilter {
  searchQuery: string;
  tags: string[];
  favoritesOnly: boolean;
  sortField: DevSortField;
  sortDirection: SortDirection;
}
