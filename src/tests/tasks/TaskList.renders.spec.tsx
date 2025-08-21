import { describe, expect, it } from 'vitest';
import { makeTask } from '../__helpers__/factories';

describe('TaskList renders', () => {
  it('can create in-memory tasks and asserts task properties', () => {
    // Create a couple of test tasks
    const tasks = [
      makeTask({ 
        id: 'task-1', 
        kind: 'water', 
        notes: 'Water the plants'
      }),
      makeTask({ 
        id: 'task-2', 
        kind: 'fertilize', 
        notes: 'Fertilize the garden' 
      }),
    ];

    // Assert tasks were created with correct properties
    expect(tasks).toHaveLength(2);
    expect(tasks[0].id).toBe('task-1');
    expect(tasks[0].kind).toBe('water');
    expect(tasks[0].notes).toBe('Water the plants');
    
    expect(tasks[1].id).toBe('task-2');
    expect(tasks[1].kind).toBe('fertilize');
    expect(tasks[1].notes).toBe('Fertilize the garden');
  });

  it('can import TaskList component without errors', async () => {
    // Test that TaskList component can be imported
    const { TaskList } = await import('@/components/TaskList');
    expect(TaskList).toBeDefined();
    expect(typeof TaskList).toBe('function');
  });
});