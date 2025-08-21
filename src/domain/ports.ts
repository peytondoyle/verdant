// A port is an interface that defines a contract for a service.
// This allows the domain logic to be decoupled from the implementation details.

export interface Plant {
  id: string;
  bed_id: string;
  name: string;
  type: 'Perennial' | 'Annual' | 'Edible';
  planted_on: Date;
  notes?: string;
  sprite_url: string;
  x: number;
  y: number;
  z_layer: number;
}

export interface PlantRepo {
  listPlants(bedId: string): Promise<Plant[]>;
  getPlant(id: string): Promise<Plant | null>;
  create(plant: Omit<Plant, 'id' | 'created_at'>): Promise<Plant>;
  update(id: string, updates: Partial<Plant>): Promise<Plant>;
  delete(id: string): Promise<void>;
}

export type TaskKind = 'water' | 'fertilize' | 'prune' | 'harvest' | 'transplant' | 'mulch' | 'custom';

export type RepeatRule = 
  | { type: 'none' }
  | { type: 'days'; interval: number } // every N days
  | { type: 'weekly'; day: number }; // weekly on specific day (0-6, 0=Sunday)

export interface Task {
  id: string;
  bed_id?: string;
  plant_id?: string;
  kind: TaskKind;
  due_on: Date;
  repeat_rule: RepeatRule;
  completed_on?: Date;
  notes?: string;
  created_at: Date;
  deleted_at?: Date;
  notification_id?: string; // For tracking scheduled notifications
}

export interface TaskRepo {
  getTaskById(id: string): Promise<Task | null>;
  getTasksByBedId(bedId: string): Promise<Task[]>;
  getTasksByPlantId(plantId: string): Promise<Task[]>;
  getUpcomingTasks(limit?: number): Promise<Task[]>;
  getOverdueTasks(): Promise<Task[]>;
  createTask(task: Omit<Task, 'id' | 'created_at'>): Promise<Task>;
  updateTask(id: string, updates: Partial<Task>): Promise<Task>;
  deleteTask(id: string): Promise<void>;
  completeTask(id: string, completedOn?: Date): Promise<Task>;
}

export interface NotificationService {
  scheduleLocal(params: {
    id?: string;
    date: Date | number;
    body: string;
    title?: string;
    repeat?: {
      kind: 'everyNDays' | 'weekly';
      n?: number;
      days?: string[];
    };
  }): Promise<string>;
  cancel(id: string): Promise<void>;
  cancelAll(): Promise<void>;
}

export interface Bed {
  id: string;
  user_id: string;
  name: string;
  base_image_url?: string;
  created_at: Date;
  deleted_at?: Date;
}

export interface BedRepo {
  listBeds(): Promise<Bed[]>;
  getBed(id: string): Promise<Bed | null>;
  create(bed: Omit<Bed, 'id' | 'created_at' | 'user_id'>): Promise<Bed>;
  update(id: string, updates: Partial<Bed>): Promise<Bed>;
  delete(id: string): Promise<void>;
}

export interface MediaStorage {
  uploadOriginal(file: File, path: string): Promise<string>;
  uploadThumb(file: File, path: string): Promise<string>;
  getSignedUrl(path: string): Promise<string>;
  deleteFile(path: string): Promise<void>;
}

export interface Photo {
  id: string;
  captured_on: Date;
  image_url: string;
  notes?: string;
  deleted_at?: Date;
  checksum: string; // Add checksum for deduplication
}

export interface PlantPhoto extends Photo {
  plant_id: string;
}

export interface BedPhoto extends Photo {
  bed_id: string;
}

export interface PhotoRepo {
  getPlantPhotos(plantId: string): Promise<PlantPhoto[]>;
  getBedPhotos(bedId: string): Promise<BedPhoto[]>;
  addPlantPhoto(photo: Omit<PlantPhoto, 'id' | 'captured_on'>): Promise<PlantPhoto>;
  addBedPhoto(photo: Omit<BedPhoto, 'id' | 'captured_on'>): Promise<BedPhoto>;
  deletePhoto(id: string): Promise<void>;
}
