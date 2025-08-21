import { create } from 'zustand';
import { NotificationService, RepeatRule, Task, TaskRepo } from '../domain/ports';
import { SupabaseTaskRepo } from '../services/db/SupabaseTaskRepo';
import { ExpoNotificationService } from '../services/ExpoNotificationService';

interface TaskState {
  // State
  tasks: Task[];
  upcomingTasks: Task[];
  overdueTasks: Task[];
  loading: boolean;
  error: string | null;

  // Dependencies
  taskRepo: TaskRepo;
  notificationService: NotificationService;

  // Actions
  loadTasks: () => Promise<void>;
  loadTasksByBedId: (bedId: string) => Promise<void>;
  loadTasksByPlantId: (plantId: string) => Promise<void>;
  loadUpcomingTasks: (limit?: number) => Promise<void>;
  loadOverdueTasks: () => Promise<void>;
  createTask: (taskData: {
    bed_id?: string;
    plant_id?: string;
    kind: Task['kind'];
    due_on: Date;
    repeat_rule: RepeatRule;
    notes?: string;
  }) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  completeTask: (id: string, completedOn?: Date) => Promise<Task>;
  refreshTasks: () => Promise<void>;
  clearError: () => void;

  // Data management helpers
  hydrate: (tasks: Task[]) => void;
  replaceData: (tasks: Task[]) => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  // Initial state
  tasks: [],
  upcomingTasks: [],
  overdueTasks: [],
  loading: false,
  error: null,

  // Dependencies
  taskRepo: new SupabaseTaskRepo(),
  notificationService: new ExpoNotificationService(),

  // Actions
  loadTasks: async () => {
    set({ loading: true, error: null });
    try {
      // Load all upcoming tasks by default
      await get().loadUpcomingTasks();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to load tasks' });
    } finally {
      set({ loading: false });
    }
  },

  loadTasksByBedId: async (bedId: string) => {
    set({ loading: true, error: null });
    try {
      const tasks = await get().taskRepo.getTasksByBedId(bedId);
      set({ tasks });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to load bed tasks' });
    } finally {
      set({ loading: false });
    }
  },

  loadTasksByPlantId: async (plantId: string) => {
    set({ loading: true, error: null });
    try {
      const tasks = await get().taskRepo.getTasksByPlantId(plantId);
      set({ tasks });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to load plant tasks' });
    } finally {
      set({ loading: false });
    }
  },

  loadUpcomingTasks: async (limit?: number) => {
    set({ loading: true, error: null });
    try {
      const upcomingTasks = await get().taskRepo.getUpcomingTasks(limit);
      set({ upcomingTasks, tasks: upcomingTasks });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to load upcoming tasks' });
    } finally {
      set({ loading: false });
    }
  },

  loadOverdueTasks: async () => {
    set({ loading: true, error: null });
    try {
      const overdueTasks = await get().taskRepo.getOverdueTasks();
      set({ overdueTasks });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to load overdue tasks' });
    } finally {
      set({ loading: false });
    }
  },

  createTask: async (taskData) => {
    set({ loading: true, error: null });
    try {
      const { taskRepo, notificationService } = get();
      
      // Create the task
      const newTask = await taskRepo.createTask({
        ...taskData,
        repeat_rule: taskData.repeat_rule,
      });

      // Schedule notifications
      let notificationIds: string[] = [];
      try {
        if (newTask.repeat_rule.type === 'none') {
          const notificationId = await notificationService.scheduleTaskReminder(newTask);
          notificationIds = [notificationId];
        } else {
          notificationIds = await notificationService.scheduleRepeatingTask(newTask);
        }

        // Update task with notification IDs (store first ID as primary)
        if (notificationIds.length > 0) {
          await taskRepo.updateTask(newTask.id, { 
            notification_id: notificationIds[0] 
          });
          newTask.notification_id = notificationIds[0];
        }
      } catch (notificationError) {
        console.warn('Failed to schedule notifications for task:', notificationError);
        // Don't fail task creation if notifications fail
      }

      // Update local state
      const currentTasks = get().tasks;
      set({ tasks: [...currentTasks, newTask] });

      // Refresh upcoming tasks if this task is upcoming
      if (newTask.due_on >= new Date()) {
        await get().loadUpcomingTasks();
      }

      return newTask;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create task' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateTask: async (id: string, updates) => {
    set({ loading: true, error: null });
    try {
      const { taskRepo, notificationService } = get();
      
      // Get current task to compare notification needs
      const currentTask = get().tasks.find(t => t.id === id);
      
      const updatedTask = await taskRepo.updateTask(id, updates);

      // Handle notification updates if due date or repeat rule changed
      if (currentTask && (updates.due_on || updates.repeat_rule)) {
        // Cancel existing notifications
        if (currentTask.notification_id) {
          await notificationService.cancelAllTaskNotifications(currentTask.id);
        }

        // Schedule new notifications if task is not completed
        if (!updatedTask.completed_on) {
          try {
            let notificationIds: string[] = [];
            if (updatedTask.repeat_rule.type === 'none') {
              const notificationId = await notificationService.scheduleTaskReminder(updatedTask);
              notificationIds = [notificationId];
            } else {
              notificationIds = await notificationService.scheduleRepeatingTask(updatedTask);
            }

            // Update task with new notification ID
            if (notificationIds.length > 0) {
              await taskRepo.updateTask(updatedTask.id, { 
                notification_id: notificationIds[0] 
              });
              updatedTask.notification_id = notificationIds[0];
            }
          } catch (notificationError) {
            console.warn('Failed to reschedule notifications for task:', notificationError);
          }
        }
      }

      // Update local state
      const currentTasks = get().tasks;
      const updatedTasks = currentTasks.map(task => 
        task.id === id ? updatedTask : task
      );
      set({ tasks: updatedTasks });

      return updatedTask;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update task' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteTask: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const { taskRepo, notificationService } = get();
      
      // Get task before deletion to cancel notifications
      const taskToDelete = get().tasks.find(t => t.id === id);
      
      // Delete the task (soft delete)
      await taskRepo.deleteTask(id);

      // Cancel associated notifications
      if (taskToDelete?.notification_id) {
        try {
          await notificationService.cancelAllTaskNotifications(id);
        } catch (notificationError) {
          console.warn('Failed to cancel notifications for deleted task:', notificationError);
        }
      }

      // Update local state
      const currentTasks = get().tasks;
      const filteredTasks = currentTasks.filter(task => task.id !== id);
      set({ tasks: filteredTasks });

      // Also remove from upcoming/overdue lists
      const upcomingTasks = get().upcomingTasks.filter(task => task.id !== id);
      const overdueTasks = get().overdueTasks.filter(task => task.id !== id);
      set({ upcomingTasks, overdueTasks });

    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete task' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  completeTask: async (id: string, completedOn?: Date) => {
    set({ loading: true, error: null });
    try {
      const { taskRepo, notificationService } = get();
      
      const completedTask = await taskRepo.completeTask(id, completedOn);

      // Cancel associated notifications since task is completed
      if (completedTask.notification_id) {
        try {
          await notificationService.cancelAllTaskNotifications(id);
        } catch (notificationError) {
          console.warn('Failed to cancel notifications for completed task:', notificationError);
        }
      }

      // Create next recurring task if needed
      if (completedTask.repeat_rule.type !== 'none') {
        try {
          const nextDueDate = calculateNextDueDate(completedTask.due_on, completedTask.repeat_rule);
          if (nextDueDate) {
            await get().createTask({
              bed_id: completedTask.bed_id,
              plant_id: completedTask.plant_id,
              kind: completedTask.kind,
              due_on: nextDueDate,
              repeat_rule: completedTask.repeat_rule,
              notes: completedTask.notes,
            });
          }
        } catch (recurringError) {
          console.warn('Failed to create next recurring task:', recurringError);
        }
      }

      // Update local state
      const currentTasks = get().tasks;
      const updatedTasks = currentTasks.map(task => 
        task.id === id ? completedTask : task
      );
      set({ tasks: updatedTasks });

      return completedTask;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to complete task' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  refreshTasks: async () => {
    const { loadUpcomingTasks, loadOverdueTasks } = get();
    await Promise.all([
      loadUpcomingTasks(),
      loadOverdueTasks(),
    ]);
  },

  clearError: () => {
    set({ error: null });
  },

  // Data management helpers
  hydrate: (tasks: Task[]) => {
    // Separate tasks into categories
    const now = new Date();
    const upcomingTasks = tasks.filter(task => task.due_on >= now && !task.completed_on);
    const overdueTasks = tasks.filter(task => task.due_on < now && !task.completed_on);
    
    set({ tasks, upcomingTasks, overdueTasks, loading: false, error: null });
  },

  replaceData: (tasks: Task[]) => {
    // Separate tasks into categories
    const now = new Date();
    const upcomingTasks = tasks.filter(task => task.due_on >= now && !task.completed_on);
    const overdueTasks = tasks.filter(task => task.due_on < now && !task.completed_on);
    
    set({ tasks, upcomingTasks, overdueTasks, loading: false, error: null });
  },
}));

// Helper function to calculate next due date for recurring tasks
function calculateNextDueDate(currentDueDate: Date, repeatRule: RepeatRule): Date | null {
  if (repeatRule.type === 'none') {
    return null;
  }

  const nextDate = new Date(currentDueDate);

  switch (repeatRule.type) {
    case 'days':
      nextDate.setDate(nextDate.getDate() + repeatRule.interval);
      break;
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
  }

  return nextDate;
}
