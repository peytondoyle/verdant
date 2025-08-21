import { ExpoNotificationService } from './ExpoNotificationService';
import { SupabaseBedRepo } from './db/SupabaseBedRepo';
import { SupabasePhotoRepo } from './db/SupabasePhotoRepo';
import { SupabasePlantRepo } from './db/SupabasePlantRepo';
import { SupabaseTaskRepo } from './db/SupabaseTaskRepo';
import { SupabaseMediaStorage } from './storage/SupabaseMediaStorage';

export const bedRepo = new SupabaseBedRepo();
export const plantRepo = new SupabasePlantRepo();
export const taskRepo = new SupabaseTaskRepo();
export const mediaStorage = new SupabaseMediaStorage();
export const notificationService = new ExpoNotificationService();
export const photoRepo = new SupabasePhotoRepo();

// Re-export domain types for convenience
export type {
    NotificationService,
    Plant,
    PlantRepo, RepeatRule, Task, TaskKind, TaskRepo
} from '../domain/ports';

// Re-export state
export { useTaskStore } from '../state/taskStore';
