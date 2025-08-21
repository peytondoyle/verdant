import { useState } from 'react';

interface Task {
  id: string;
  title: string;
  dueDate?: string;
  status: 'overdue' | 'completed' | 'pending';
}

const MOCK_TASKS: Task[] = [
  {
    id: '1',
    title: 'Water the plants',
    dueDate: '2024-03-01',
    status: 'completed',
  },
  {
    id: '2',
    title: 'Fertilize the garden',
    dueDate: '2024-03-05',
    status: 'overdue',
  },
  {
    id: '3',
    title: 'Prune the roses',
    dueDate: '2024-03-10',
    status: 'pending',
  },
  {
    id: '4',
    title: 'Repot the monstera',
    status: 'pending',
  },
];

export const useTasksView = () => {
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);

  const handleSelectTask = (taskId: string) => {
    console.log(`Task ${taskId} selected in hook`);
    // Future: Logic to mark task as complete, navigate, etc.
  };

  return {
    tasks,
    onSelectTask: handleSelectTask,
  };
};
