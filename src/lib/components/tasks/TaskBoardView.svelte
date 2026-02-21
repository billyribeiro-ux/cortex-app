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
      onAddTask={() => tasksStore.openCreateModal(status)}
    />
  {/each}
</div>

<style>
  .board {
    display: flex;
    gap: var(--space-4);
    height: 100%;
    overflow-x: auto;
    padding-bottom: var(--space-2);
  }
</style>
