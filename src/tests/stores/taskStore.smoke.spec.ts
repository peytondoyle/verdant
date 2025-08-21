import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useTaskStore } from '@/state/taskStore';

// Mock the Notifier to prevent network calls
vi.mock('@/services/notifications/NotifierExpo', () => ({
  NotifierExpo: vi.fn().mockImplementation(() => ({
    scheduleLocal: vi.fn().mockResolvedValue('mock-notification-id'),
    cancel: vi.fn().mockResolvedValue(undefined),
  })),
}));

// Mock the TaskRepo to prevent database calls
vi.mock('@/services/db/SupabaseTaskRepo', () => ({
  SupabaseTaskRepo: vi.fn().mockImplementation(() => ({
    createTask: vi.fn().mockResolvedValue({
      id: 'mock-task-id',
      bed_id: 'bed-1',
      plant_id: 'plant-1',
      kind: 'water',
      due_on: new Date('2024-03-15'),
      repeat_rule: { type: 'none' },
      completed_on: null,
      notes: 'Test watering task',
      created_at: new Date(),
      deleted_at: undefined,
    }),
    updateTask: vi.fn().mockResolvedValue({
      id: 'mock-task-id',
      bed_id: 'bed-1',
      plant_id: 'plant-1', 
      kind: 'water',
      due_on: new Date(),
      repeat_rule: { type: 'none' },
      completed_on: null,
      notes: '',
      created_at: new Date(),
      deleted_at: undefined,
    }),
    deleteTask: vi.fn().mockResolvedValue(undefined),
    getTasksByBedId: vi.fn().mockResolvedValue([]),
    getTasksByPlantId: vi.fn().mockResolvedValue([]),
    getUpcomingTasks: vi.fn().mockResolvedValue([]),
    getOverdueTasks: vi.fn().mockResolvedValue([]),
    completeTask: vi.fn().mockResolvedValue({
      id: 'mock-task-id',
      completed_on: new Date(),
    }),
  })),
}));

describe('taskStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useTaskStore.getState().replaceData([]);
  });

  it('initializes store, adds task with mocked notifications, and asserts task in state', async () => {
    const store = useTaskStore.getState();
    
    // Initial state should be empty
    expect(store.tasks).toEqual([]);

    // Create task via store (this will use mocked services)
    await store.createTask({
      bed_id: 'bed-1',
      plant_id: 'plant-1',
      kind: 'water',
      due_on: new Date('2024-03-15'),
      notes: 'Test watering task',
    });

    // Assert task is now in state (from mock)
    const updatedStore = useTaskStore.getState();
    expect(updatedStore.tasks).toHaveLength(1);
    expect(updatedStore.tasks[0]).toMatchObject({
      id: 'mock-task-id',
      bed_id: 'bed-1',
      plant_id: 'plant-1',
      kind: 'water',
      notes: 'Test watering task',
    });
    expect(updatedStore.tasks[0].due_on).toBeInstanceOf(Date);
  });
});