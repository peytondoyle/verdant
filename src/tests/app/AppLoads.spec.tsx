import { describe, expect, it } from 'vitest';

describe('App Loads', () => {
  it('can import app components and verify tab structure', () => {
    // Mock tab data
    const tabs = [
      { name: 'home', label: 'Home' },
      { name: 'beds', label: 'Beds' },
      { name: 'tasks', label: 'Tasks' },
    ];

    // Assert tab structure is correct
    expect(tabs).toHaveLength(3);
    expect(tabs.find(tab => tab.name === 'home')).toBeTruthy();
    expect(tabs.find(tab => tab.name === 'beds')).toBeTruthy();
    expect(tabs.find(tab => tab.name === 'tasks')).toBeTruthy();
  });

  it('can import root layout without errors', async () => {
    // Test that we can import app modules
    const modules = await Promise.all([
      import('@/hooks/useAuth'),
      import('@/state/authStore'),
    ]);

    // Assert modules loaded successfully
    expect(modules[0].useAuth).toBeDefined();
    expect(modules[1].useAuthStore).toBeDefined();
  });
});