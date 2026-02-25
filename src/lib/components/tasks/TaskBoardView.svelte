<script lang="ts">
  import type { TaskStatus } from '$lib/types/index.js';
  import { tasksStore } from '$lib/stores/tasks.svelte.js';
  import KanbanColumn from './KanbanColumn.svelte';

  const statuses: TaskStatus[] = ['todo', 'in-progress', 'review', 'done'];
</script>

<div class="board">
  {#each statuses as status}
    <KanbanColumn
      {status}
      tasks={tasksStore.tasksByStatus[status]}
      onAddTask={() => tasksStore.openCreateModal({ defaultStatus: status })}
    />
  {/each}
</div>

<style>
  .board {
    display: flex;
    gap: var(--space-4);
    height: 100%;
    overflow-x: auto;
    padding: var(--space-4);
    padding-top: 0;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
    scroll-snap-type: x proximity;
  }

  .board > :global(*) {
    scroll-snap-align: start;
  }

  .board::-webkit-scrollbar {
    height: 6px;
  }

  .board::-webkit-scrollbar-track {
    background: transparent;
    margin: 0 var(--space-4);
  }

  .board::-webkit-scrollbar-thumb {
    background: var(--color-border-subtle);
    border-radius: var(--radius-full);
    transition: background var(--transition-fast);
  }

  .board::-webkit-scrollbar-thumb:hover {
    background: var(--color-border-strong);
  }
</style>
