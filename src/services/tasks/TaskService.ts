import { Task, TaskKind } from '../../domain/ports';
import { useTaskStore } from '../../state/taskStore';
import { Notifier, NotifierExpo } from '../notifications/NotifierExpo';

export interface CreateTaskParams {
  bed_id?: string;
  plant_id?: string;
  kind: TaskKind;
  due_on: Date;
  repeat_rule?: string; // Simple format: "every:N:days" or "weekly:Mon,Thu"
  notes?: string;
}

export class TaskService {
  private notifier: Notifier;

  constructor(notifier?: Notifier) {
    this.notifier = notifier || new NotifierExpo();
  }

  async createTask(taskParams: CreateTaskParams): Promise<Task> {
    try {
      // Convert simple repeat_rule string to domain RepeatRule format
      const repeatRule = this.parseRepeatRule(taskParams.repeat_rule);

      // Create task through store
      const taskStore = useTaskStore.getState();
      const newTask = await taskStore.createTask({
        bed_id: taskParams.bed_id,
        plant_id: taskParams.plant_id,
        kind: taskParams.kind,
        due_on: taskParams.due_on,
        repeat_rule: repeatRule,
        notes: taskParams.notes,
      });

      // Schedule notification using the simpler Notifier interface
      try {
        await this.notifier.scheduleLocal({
          id: newTask.id,
          date: newTask.due_on,
          body: this.generateNotificationBody(newTask),
          repeatRule: taskParams.repeat_rule,
        });
      } catch (notificationError) {
        console.warn('Failed to schedule notification for task:', notificationError);
        // Don't fail task creation if notifications fail
      }

      return newTask;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  async deleteTask(id: string): Promise<void> {
    try {
      // Cancel notification first
      await this.notifier.cancel(id);

      // Delete task through store
      const taskStore = useTaskStore.getState();
      await taskStore.deleteTask(id);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  async completeTask(id: string, completedOn?: Date): Promise<Task> {
    try {
      // Cancel existing notification
      await this.notifier.cancel(id);

      // Complete task through store
      const taskStore = useTaskStore.getState();
      const completedTask = await taskStore.completeTask(id, completedOn);

      return completedTask;
    } catch (error) {
      console.error('Error completing task:', error);
      throw error;
    }
  }

  private parseRepeatRule(repeatRuleStr?: string): Task['repeat_rule'] {
    if (!repeatRuleStr) {
      return { type: 'none' };
    }

    // Parse "every:N:days" format
    if (repeatRuleStr.startsWith('every:')) {
      const parts = repeatRuleStr.split(':');
      if (parts.length === 3 && parts[2] === 'days') {
        const interval = parseInt(parts[1], 10);
        if (!isNaN(interval) && interval > 0) {
          return { type: 'days', interval };
        }
      }
    }

    // Parse "weekly:Mon,Thu" format - convert to multiple weekly rules
    // For simplicity, we'll just take the first day mentioned for the domain model
    if (repeatRuleStr.startsWith('weekly:')) {
      const daysStr = repeatRuleStr.substring(7); // Remove "weekly:"
      const dayNames = daysStr.split(',').map(d => d.trim());
      const dayMapping: Record<string, number> = {
        'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6,
        'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6
      };

      const firstDay = dayNames[0];
      const dayNumber = dayMapping[firstDay];
      if (dayNumber !== undefined) {
        return { type: 'weekly', day: dayNumber };
      }
    }

    // Fallback to no repeat if parsing fails
    console.warn('Could not parse repeat rule:', repeatRuleStr);
    return { type: 'none' };
  }

  private generateNotificationBody(task: Task): string {
    const taskTypeMap = {
      water: '💧 Time to water',
      fertilize: '🌱 Time to fertilize',
      prune: '✂️ Time to prune',
      harvest: '🥕 Ready to harvest',
      transplant: '🌿 Time to transplant',
      mulch: '🍂 Time to mulch',
      custom: '📝 Garden task',
    };

    const action = taskTypeMap[task.kind] || '📝 Garden task';
    
    if (task.plant_id) {
      return `${action} your plant`;
    } else if (task.bed_id) {
      return `${action} your garden bed`;
    } else {
      return `${action}`;
    }
  }

  // Helper method for testing and debugging
  async getScheduledNotifications() {
    if (this.notifier instanceof NotifierExpo) {
      return await this.notifier.getAllScheduledNotifications();
    }
    return [];
  }

  // Static helper method to create a task with simple parameters (useful for quick task creation)
  static async quickCreateTask(
    kind: TaskKind,
    dueInMinutes: number,
    options?: {
      bed_id?: string;
      plant_id?: string;
      notes?: string;
      repeat?: string;
    }
  ): Promise<Task> {
    const service = new TaskService();
    const dueDate = new Date();
    dueDate.setMinutes(dueDate.getMinutes() + dueInMinutes);

    return await service.createTask({
      kind,
      due_on: dueDate,
      bed_id: options?.bed_id,
      plant_id: options?.plant_id,
      notes: options?.notes,
      repeat_rule: options?.repeat,
    });
  }
}
