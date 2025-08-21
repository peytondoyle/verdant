import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useTaskStore } from '@/state/taskStore';
import type { Task } from '@/domain/ports';

// Mock the task repo and notifier to prevent network calls
vi.mock('@/services/db/SupabaseTaskRepo', () => ({
  SupabaseTaskRepo: vi.fn(() => ({
    createTask: vi.fn().mockResolvedValue({
      id: 'task-1',
      kind: 'water',
      due_on: new Date('2024-01-01'),
      repeat_rule: { type: 'none' },
      created_at: new Date(),
      notes: 'Water the plants',
    }),
    updateTask: vi.fn().mockResolvedValue({
      id: 'task-1',
      kind: 'water',
      due_on: new Date('2024-01-01'),
      repeat_rule: { type: 'none' },
      created_at: new Date(),
      notes: 'Water the plants',
    }),
    getUpcomingTasks: vi.fn().mockResolvedValue([]),
    getOverdueTasks: vi.fn().mockResolvedValue([]),
    getTasksByBedId: vi.fn().mockResolvedValue([]),
    getTasksByPlantId: vi.fn().mockResolvedValue([]),
  })),
}));

// Mock the notifier to prevent actual notifications
vi.mock('@/services/notifications/NotifierExpo', () => ({
  NotifierExpo: vi.fn(() => ({
    scheduleLocal: vi.fn().mockResolvedValue('notification-id'),
    cancel: vi.fn().mockResolvedValue(undefined),
    cancelAll: vi.fn().mockResolvedValue(undefined),
  })),
}));

describe('taskStore - Smoke Test', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useTaskStore.setState({
      tasks: [],
      upcomingTasks: [],
      overdueTasks: [],
      loading: false,
      error: null,
    });
    vi.clearAllMocks();
  });

  it('initializes taskStore state and adds a task', async () => {
    // Get initial state
    const initialState = useTaskStore.getState();
    expect(initialState.tasks).toHaveLength(0);
    expect(initialState.loading).toBe(false);
    expect(initialState.error).toBeNull();

    // Create a new task using the store method
    const taskData = {
      kind: 'water' as const,
      due_on: new Date('2024-01-01'),
      repeat_rule: { type: 'none' as const },
      notes: 'Water the plants',
    };

    await useTaskStore.getState().createTask(taskData);

    // Assert the task was added to state
    const updatedState = useTaskStore.getState();
    expect(updatedState.tasks).toHaveLength(1);
    expect(updatedState.tasks[0].kind).toBe('water');
    expect(updatedState.tasks[0].notes).toBe('Water the plants');
    expect(updatedState.loading).toBe(false);
  });

  it('can directly set state for testing', () => {
    // Test direct state manipulation (for testing scenarios)
    const mockTask: Task = {
      id: 'test-task',
      kind: 'fertilize',
      due_on: new Date('2024-01-02'),
      repeat_rule: { type: 'none' },
      created_at: new Date(),
      notes: 'Test task',
    };

    useTaskStore.setState({ tasks: [mockTask] });

    const state = useTaskStore.getState();
    expect(state.tasks).toHaveLength(1);
    expect(state.tasks[0].id).toBe('test-task');
    expect(state.tasks[0].kind).toBe('fertilize');
  });
});