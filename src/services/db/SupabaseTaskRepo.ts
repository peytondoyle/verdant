import { RepeatRule, Task, TaskRepo } from '../../domain/ports';
import { supabase } from '../../lib/supabase';

export class SupabaseTaskRepo implements TaskRepo {
  async getTaskById(id: string): Promise<Task | null> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error) {
      console.error('Error fetching task:', error);
      return null;
    }

    return this.mapRowToTask(data);
  }

  async getTasksByBedId(bedId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('bed_id', bedId)
      .is('deleted_at', null)
      .order('due_on', { ascending: true });

    if (error) {
      console.error('Error fetching tasks by bed:', error);
      return [];
    }

    return data.map(row => this.mapRowToTask(row));
  }

  async getTasksByPlantId(plantId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('plant_id', plantId)
      .is('deleted_at', null)
      .order('due_on', { ascending: true });

    if (error) {
      console.error('Error fetching tasks by plant:', error);
      return [];
    }

    return data.map(row => this.mapRowToTask(row));
  }

  async getUpcomingTasks(limit: number = 50): Promise<Task[]> {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .gte('due_on', now)
      .is('deleted_at', null)
      .is('completed_on', null)
      .order('due_on', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error fetching upcoming tasks:', error);
      return [];
    }

    return data.map(row => this.mapRowToTask(row));
  }

  async getOverdueTasks(): Promise<Task[]> {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .lt('due_on', now)
      .is('deleted_at', null)
      .is('completed_on', null)
      .order('due_on', { ascending: true });

    if (error) {
      console.error('Error fetching overdue tasks:', error);
      return [];
    }

    return data.map(row => this.mapRowToTask(row));
  }

  async createTask(task: Omit<Task, 'id' | 'created_at'>): Promise<Task> {
    const taskData = {
      ...task,
      due_on: task.due_on.toISOString(),
      completed_on: task.completed_on?.toISOString() || null,
      repeat_rule: JSON.stringify(task.repeat_rule),
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('tasks')
      .insert(taskData)
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating task: ${error.message}`);
    }

    return this.mapRowToTask(data);
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const updateData: any = { ...updates };
    
    // Convert Date objects to ISO strings for database storage
    if (updateData.due_on) {
      updateData.due_on = updateData.due_on.toISOString();
    }
    if (updateData.completed_on) {
      updateData.completed_on = updateData.completed_on.toISOString();
    }
    if (updateData.deleted_at) {
      updateData.deleted_at = updateData.deleted_at.toISOString();
    }
    if (updateData.repeat_rule) {
      updateData.repeat_rule = JSON.stringify(updateData.repeat_rule);
    }

    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating task: ${error.message}`);
    }

    return this.mapRowToTask(data);
  }

  async deleteTask(id: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting task: ${error.message}`);
    }
  }

  async completeTask(id: string, completedOn?: Date): Promise<Task> {
    const completedAt = completedOn || new Date();
    
    const { data, error } = await supabase
      .from('tasks')
      .update({ completed_on: completedAt.toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error completing task: ${error.message}`);
    }

    return this.mapRowToTask(data);
  }

  private mapRowToTask(row: any): Task {
    return {
      id: row.id,
      bed_id: row.bed_id,
      plant_id: row.plant_id,
      kind: row.kind,
      due_on: new Date(row.due_on),
      repeat_rule: JSON.parse(row.repeat_rule) as RepeatRule,
      completed_on: row.completed_on ? new Date(row.completed_on) : undefined,
      notes: row.notes,
      created_at: new Date(row.created_at),
      deleted_at: row.deleted_at ? new Date(row.deleted_at) : undefined,
      notification_id: row.notification_id,
    };
  }
}
