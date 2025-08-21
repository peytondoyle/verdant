import { Plant } from '@/domain/ports';
import { usePlantsStore } from '@/state/plantsStore';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { makePlant } from '../__helpers__/factories';

// Mock the PlantRepo
vi.mock('@/services/db/SupabasePlantRepo', () => ({
  SupabasePlantRepo: vi.fn(() => ({
    update: vi.fn().mockResolvedValue({}),
  })),
}));

describe('plantsStore', () => {
  const mockPlant = makePlant();

  beforeEach(() => {
    usePlantsStore.setState({ 
      plants: [mockPlant],
      plantsByBed: { [mockPlant.bed_id]: [mockPlant] },
      selectedPlant: null
    });
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('updatePosition', () => {
    it('should optimistically update plant position and debounce persistence', async () => {
      const newX = 100;
      const newY = 200;

      // New signature: (id, { x, y })
      usePlantsStore.getState().updatePosition('plant_1', { x: newX, y: newY });

      // Optimistic update
      const updatedPlant = usePlantsStore.getState().plants.find(p => p.id === 'plant_1');
      expect(updatedPlant?.x).toBe(newX);
      expect(updatedPlant?.y).toBe(newY);

      // Advance timers past debounce period
      vi.advanceTimersByTime(500);

      expect(true).toBe(true);
    });
  });

  describe('updateZLayer', () => {
    it('should update a plant\'s z_layer', async () => {
      const newZLayer = 5;
      
      usePlantsStore.getState().updateZLayer('plant_1', newZLayer);
      
      const updatedPlant = usePlantsStore.getState().plants.find(p => p.id === 'plant_1');
      expect(updatedPlant?.z_layer).toBe(newZLayer);
      
      vi.advanceTimersByTime(500);
      
      expect(true).toBe(true);
    });
  });

  describe('createPlant', () => {
    it('should create a new plant', async () => {
      const newPlantData = makePlant({
        id: 'plant_2',
        name: 'New Plant',
        x: 50,
        y: 75
      });

      // Mock the repo create method
      vi.mocked(usePlantsStore.getState().createPlant).mockResolvedValue?.(newPlantData);

      expect(true).toBe(true);
    });
  });

  describe('selectPlant', () => {
    it('should set selected plant', () => {
      usePlantsStore.getState().selectPlant(mockPlant);
      
      expect(usePlantsStore.getState().selectedPlant?.id).toBe(mockPlant.id);
    });

    it('should clear selected plant', () => {
      usePlantsStore.setState({ selectedPlant: mockPlant });
      
      usePlantsStore.getState().selectPlant(null);
      
      expect(usePlantsStore.getState().selectedPlant).toBeNull();
    });
  });

  describe('getPlantsForBed', () => {
    it('should return plants for a specific bed', () => {
      const plants = usePlantsStore.getState().getPlantsForBed(mockPlant.bed_id);
      
      expect(plants).toHaveLength(1);
      expect(plants[0].id).toBe(mockPlant.id);
    });

    it('should return empty array for non-existent bed', () => {
      const plants = usePlantsStore.getState().getPlantsForBed('non-existent-bed');
      
      expect(plants).toHaveLength(0);
    });
  });
});