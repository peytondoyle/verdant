import { Task } from '../domain/ports';

export interface TaskPresenter {
  id: string;
  bedId?: string;
  plantId?: string;
  kind: string;
  dueOn: Date;
  repeatRule: Task['repeat_rule'];
  completedOn?: Date;
  notes?: string;
  createdAt: Date;
  deletedAt?: Date;
  notificationId?: string;
}

export const mapTask = (task: Task): TaskPresenter => {
  return {
    id: task.id,
    bedId: task.bed_id,
    plantId: task.plant_id,
    kind: task.kind,
    dueOn: task.due_on,
    repeatRule: task.repeat_rule,
    completedOn: task.completed_on,
    notes: task.notes,
    createdAt: task.created_at,
    deletedAt: task.deleted_at,
    notificationId: task.notification_id,
  };
};

export const mapTasks = (tasks: Task[]): TaskPresenter[] => {
  return tasks.map(mapTask);
};
