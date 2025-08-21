
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Task } from '../domain/ports';
import { taskStore } from '../state/taskStore';

export function useTasks() {
  const queryClient = useQueryClient();

  const { data: tasks, isLoading, isError, refetch } = useQuery<Task[]>(
    { queryKey: ['tasks'], queryFn: () => taskStore.getAllTasks(), },
  );

  const invalidateTasks = () => {
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
  };

  return {
    tasks,
    isLoading,
    isError,
    refetch,
    invalidateTasks,
  };
}
