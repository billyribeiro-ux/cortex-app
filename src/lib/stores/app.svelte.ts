import type {
  Note,
  Task,
  Goal,
  Prompt,
  Stack,
  GithubItem,
  TerminalItem,
  VercelItem,
  PnpmItem,
  SnippetItem,
  SupabaseItem,
  RustItem,
  DevItem,
  AppState,
} from '$lib/types/index.js';
import { loadFromStorage, saveToStorage } from '$lib/utils/local-storage.js';

function createAppStore() {
  let notes = $state<Note[]>(loadFromStorage('cortex:notes', []));
  let tasks = $state<Task[]>(loadFromStorage('cortex:tasks', []));
  let goals = $state<Goal[]>(loadFromStorage('cortex:goals', []));
  let prompts = $state<Prompt[]>(loadFromStorage('cortex:prompts', []));
  let stacks = $state<Stack[]>(loadFromStorage('cortex:stacks', []));
  let github = $state<GithubItem[]>(loadFromStorage('cortex:github', []));
  let terminal = $state<TerminalItem[]>(loadFromStorage('cortex:terminal', []));
  let vercel = $state<VercelItem[]>(loadFromStorage('cortex:vercel', []));
  let pnpm = $state<PnpmItem[]>(loadFromStorage('cortex:pnpm', []));
  let snippets = $state<SnippetItem[]>(loadFromStorage('cortex:claude-code', []));
  let supabase = $state<SupabaseItem[]>(loadFromStorage('cortex:supabase', []));
  let rust = $state<RustItem[]>(loadFromStorage('cortex:rust', []));
  let dev = $state<DevItem[]>(loadFromStorage('cortex:dev', []));
  let activeView = $state<AppState['activeView']>('dashboard');
  let sidebarCollapsed = $state<boolean>(loadFromStorage('cortex:sidebar-collapsed', false));
  let mobileSidebarOpen = $state<boolean>(false);
  let searchQuery = $state<string>('');

  // Derived counts
  const noteCount = $derived(notes.length);
  const openTaskCount = $derived(tasks.filter((t) => t.status !== 'done').length);
  const activeGoalCount = $derived(goals.filter((g) => g.status === 'active').length);
  const promptCount = $derived(prompts.length);
  const stackCount = $derived(stacks.length);
  const githubCount = $derived(github.length);
  const terminalCount = $derived(terminal.length);
  const vercelCount = $derived(vercel.length);
  const pnpmCount = $derived(pnpm.length);
  const snippetsCount = $derived(snippets.length);
  const supabaseCount = $derived(supabase.length);
  const rustCount = $derived(rust.length);
  const devCount = $derived(dev.length);

  return {
    // State (getters for reading, since we can't export reassigned $state)
    get notes() { return notes; },
    get tasks() { return tasks; },
    get goals() { return goals; },
    get prompts() { return prompts; },
    get stacks() { return stacks; },
    get github() { return github; },
    get terminal() { return terminal; },
    get vercel() { return vercel; },
    get pnpm() { return pnpm; },
    get snippets() { return snippets; },
    get supabase() { return supabase; },
    get rust() { return rust; },
    get dev() { return dev; },
    get activeView() { return activeView; },
    get sidebarCollapsed() { return sidebarCollapsed; },
    get mobileSidebarOpen() { return mobileSidebarOpen; },
    get searchQuery() { return searchQuery; },

    // Derived
    get noteCount() { return noteCount; },
    get openTaskCount() { return openTaskCount; },
    get activeGoalCount() { return activeGoalCount; },
    get promptCount() { return promptCount; },
    get stackCount() { return stackCount; },
    get githubCount() { return githubCount; },
    get terminalCount() { return terminalCount; },
    get vercelCount() { return vercelCount; },
    get pnpmCount() { return pnpmCount; },
    get snippetsCount() { return snippetsCount; },
    get supabaseCount() { return supabaseCount; },
    get rustCount() { return rustCount; },
    get devCount() { return devCount; },

    // Setters
    set activeView(view: AppState['activeView']) { activeView = view; },
    set sidebarCollapsed(value: boolean) {
      sidebarCollapsed = value;
      saveToStorage('cortex:sidebar-collapsed', sidebarCollapsed);
    },
    set mobileSidebarOpen(value: boolean) { mobileSidebarOpen = value; },
    set searchQuery(value: string) { searchQuery = value; },

    // Note mutations
    addNote(note: Note): void {
      notes = [...notes, note];
      saveToStorage('cortex:notes', notes);
    },
    updateNote(id: string, updates: Partial<Note>): void {
      const index = notes.findIndex((n) => n.id === id);
      if (index !== -1) {
        notes = notes.map((n, i) =>
          i === index ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
        );
        saveToStorage('cortex:notes', notes);
      }
    },
    deleteNote(id: string): void {
      notes = notes.filter((n) => n.id !== id);
      saveToStorage('cortex:notes', notes);
    },

    // Task mutations
    addTask(task: Task): void {
      tasks = [...tasks, task];
      saveToStorage('cortex:tasks', tasks);
    },
    updateTask(id: string, updates: Partial<Task>): void {
      const index = tasks.findIndex((t) => t.id === id);
      if (index !== -1) {
        tasks = tasks.map((t, i) =>
          i === index ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
        );
        saveToStorage('cortex:tasks', tasks);
      }
    },
    deleteTask(id: string): void {
      tasks = tasks.filter((t) => t.id !== id);
      saveToStorage('cortex:tasks', tasks);
    },

    // Goal mutations
    addGoal(goal: Goal): void {
      goals = [...goals, goal];
      saveToStorage('cortex:goals', goals);
    },
    updateGoal(id: string, updates: Partial<Goal>): void {
      const index = goals.findIndex((g) => g.id === id);
      if (index !== -1) {
        goals = goals.map((g, i) =>
          i === index ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g
        );
        saveToStorage('cortex:goals', goals);
      }
    },
    deleteGoal(id: string): void {
      goals = goals.filter((g) => g.id !== id);
      saveToStorage('cortex:goals', goals);
    },

    // Prompt mutations
    addPrompt(prompt: Prompt): void {
      prompts = [...prompts, prompt];
      saveToStorage('cortex:prompts', prompts);
    },
    updatePrompt(id: string, updates: Partial<Prompt>): void {
      const index = prompts.findIndex((p) => p.id === id);
      if (index !== -1) {
        prompts = prompts.map((p, i) =>
          i === index ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
        );
        saveToStorage('cortex:prompts', prompts);
      }
    },
    deletePrompt(id: string): void {
      prompts = prompts.filter((p) => p.id !== id);
      saveToStorage('cortex:prompts', prompts);
    },

    // Stack mutations
    addStack(stack: Stack): void {
      stacks = [...stacks, stack];
      saveToStorage('cortex:stacks', stacks);
    },
    updateStack(id: string, updates: Partial<Stack>): void {
      const index = stacks.findIndex((s) => s.id === id);
      if (index !== -1) {
        stacks = stacks.map((s, i) =>
          i === index ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
        );
        saveToStorage('cortex:stacks', stacks);
      }
    },
    deleteStack(id: string): void {
      stacks = stacks.filter((s) => s.id !== id);
      saveToStorage('cortex:stacks', stacks);
    },

    // GitHub mutations
    addGithub(item: GithubItem): void {
      github = [...github, item];
      saveToStorage('cortex:github', github);
    },
    updateGithub(id: string, updates: Partial<GithubItem>): void {
      const index = github.findIndex((x) => x.id === id);
      if (index !== -1) {
        github = github.map((x, i) =>
          i === index ? { ...x, ...updates, updatedAt: new Date().toISOString() } : x
        );
        saveToStorage('cortex:github', github);
      }
    },
    deleteGithub(id: string): void {
      github = github.filter((x) => x.id !== id);
      saveToStorage('cortex:github', github);
    },

    // Terminal mutations
    addTerminal(item: TerminalItem): void {
      terminal = [...terminal, item];
      saveToStorage('cortex:terminal', terminal);
    },
    updateTerminal(id: string, updates: Partial<TerminalItem>): void {
      const index = terminal.findIndex((x) => x.id === id);
      if (index !== -1) {
        terminal = terminal.map((x, i) =>
          i === index ? { ...x, ...updates, updatedAt: new Date().toISOString() } : x
        );
        saveToStorage('cortex:terminal', terminal);
      }
    },
    deleteTerminal(id: string): void {
      terminal = terminal.filter((x) => x.id !== id);
      saveToStorage('cortex:terminal', terminal);
    },

    // Vercel mutations
    addVercel(item: VercelItem): void {
      vercel = [...vercel, item];
      saveToStorage('cortex:vercel', vercel);
    },
    updateVercel(id: string, updates: Partial<VercelItem>): void {
      const index = vercel.findIndex((x) => x.id === id);
      if (index !== -1) {
        vercel = vercel.map((x, i) =>
          i === index ? { ...x, ...updates, updatedAt: new Date().toISOString() } : x
        );
        saveToStorage('cortex:vercel', vercel);
      }
    },
    deleteVercel(id: string): void {
      vercel = vercel.filter((x) => x.id !== id);
      saveToStorage('cortex:vercel', vercel);
    },

    // PNPM mutations
    addPnpm(item: PnpmItem): void {
      pnpm = [...pnpm, item];
      saveToStorage('cortex:pnpm', pnpm);
    },
    updatePnpm(id: string, updates: Partial<PnpmItem>): void {
      const index = pnpm.findIndex((x) => x.id === id);
      if (index !== -1) {
        pnpm = pnpm.map((x, i) =>
          i === index ? { ...x, ...updates, updatedAt: new Date().toISOString() } : x
        );
        saveToStorage('cortex:pnpm', pnpm);
      }
    },
    deletePnpm(id: string): void {
      pnpm = pnpm.filter((x) => x.id !== id);
      saveToStorage('cortex:pnpm', pnpm);
    },

    // Snippets mutations
    addSnippet(item: SnippetItem): void {
      snippets = [...snippets, item];
      saveToStorage('cortex:claude-code', snippets);
    },
    updateSnippet(id: string, updates: Partial<SnippetItem>): void {
      const index = snippets.findIndex((x) => x.id === id);
      if (index !== -1) {
        snippets = snippets.map((x, i) =>
          i === index ? { ...x, ...updates, updatedAt: new Date().toISOString() } : x
        );
        saveToStorage('cortex:claude-code', snippets);
      }
    },
    deleteSnippet(id: string): void {
      snippets = snippets.filter((x) => x.id !== id);
      saveToStorage('cortex:claude-code', snippets);
    },

    // Supabase mutations
    addSupabase(item: SupabaseItem): void {
      supabase = [...supabase, item];
      saveToStorage('cortex:supabase', supabase);
    },
    updateSupabase(id: string, updates: Partial<SupabaseItem>): void {
      const index = supabase.findIndex((x) => x.id === id);
      if (index !== -1) {
        supabase = supabase.map((x, i) =>
          i === index ? { ...x, ...updates, updatedAt: new Date().toISOString() } : x
        );
        saveToStorage('cortex:supabase', supabase);
      }
    },
    deleteSupabase(id: string): void {
      supabase = supabase.filter((x) => x.id !== id);
      saveToStorage('cortex:supabase', supabase);
    },

    // Rust mutations
    addRust(item: RustItem): void {
      rust = [...rust, item];
      saveToStorage('cortex:rust', rust);
    },
    updateRust(id: string, updates: Partial<RustItem>): void {
      const index = rust.findIndex((x) => x.id === id);
      if (index !== -1) {
        rust = rust.map((x, i) =>
          i === index ? { ...x, ...updates, updatedAt: new Date().toISOString() } : x
        );
        saveToStorage('cortex:rust', rust);
      }
    },
    deleteRust(id: string): void {
      rust = rust.filter((x) => x.id !== id);
      saveToStorage('cortex:rust', rust);
    },

    // Dev mutations
    addDev(item: DevItem): void {
      dev = [...dev, item];
      saveToStorage('cortex:dev', dev);
    },
    updateDev(id: string, updates: Partial<DevItem>): void {
      const index = dev.findIndex((x) => x.id === id);
      if (index !== -1) {
        dev = dev.map((x, i) =>
          i === index ? { ...x, ...updates, updatedAt: new Date().toISOString() } : x
        );
        saveToStorage('cortex:dev', dev);
      }
    },
    deleteDev(id: string): void {
      dev = dev.filter((x) => x.id !== id);
      saveToStorage('cortex:dev', dev);
    }
  };
}

export const appStore = createAppStore();
