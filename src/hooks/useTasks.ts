
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Task } from '../domain/ports';
import { useTaskStore } from '../state/taskStore';

export function useTasks() {
  const queryClient = useQueryClient();
  const taskStore = useTaskStore();

  const { data: tasks, isPending, isError, refetch } = useQuery<Task[]>({
    queryKey: ['tasks'], 
    queryFn: async () => {
      await taskStore.loadTasks();
      return taskStore.tasks;
    }
  });

  const invalidateTasks = () => {
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
  };

  return {
    tasks,
    isPending,
    isError,
    refetch,
    invalidateTasks,
  };
}
