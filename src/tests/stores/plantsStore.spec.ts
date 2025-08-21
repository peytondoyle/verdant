import { PlantPresenter } from '@/presenters/PlantPresenter';
import { createPlantsStore, Plant } from '@/state/plantsStore';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the PlantPresenter and its methods
vi.mock('@/presenters/PlantPresenter', () => ({
  PlantPresenter: {
    updatePlantPosition: vi.fn(),
    updatePlantZLayer: vi.fn(),
  },
}));

const mockPlant: Plant = {
  id: 'plant1',
  bedId: 'bed1',
  name: 'Rose',
  type: 'Flower',
  plantedOn: '2023-01-01',
  spriteUrl: 'url',
  zLayer: 0,
  x: 0,
  y: 0,
  notes: '',
  photoCount: 0,
  deletedAt: null,
};

describe('plantsStore', () => {
  let usePlantsStore: ReturnType<typeof createPlantsStore>;

  beforeEach(() => {
    usePlantsStore = createPlantsStore();
    usePlantsStore.setState({ plants: [mockPlant] });
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

      usePlantsStore.getState().updatePosition('plant1', newX, newY);

      // Optimistic update
      expect(usePlantsStore.getState().plants[0].x).toBe(newX);
      expect(usePlantsStore.getState().plants[0].y).toBe(newY);

      // Ensure presenter is not called immediately
      expect(PlantPresenter.updatePlantPosition).not.toHaveBeenCalled();

      // Advance timers past debounce period
      vi.advanceTimersByTime(500);

      // Expect presenter to be called with correct values
      expect(PlantPresenter.updatePlantPosition).toHaveBeenCalledWith(
        'plant1',
        expect.objectContaining({ x: newX, y: newY })
      );
    });

    it('should rollback position on persistence error', async () => {
      const originalX = mockPlant.x;
      const originalY = mockPlant.y;
      const newX = 100;
      const newY = 200;

      (PlantPresenter.updatePlantPosition as vi.Mock).mockRejectedValueOnce(new Error('Failed to update'));

      usePlantsStore.getState().updatePosition('plant1', newX, newY);

      // Optimistic update
      expect(usePlantsStore.getState().plants[0].x).toBe(newX);
      expect(usePlantsStore.getState().plants[0].y).toBe(newY);

      // Advance timers and await persistence
      await vi.advanceTimersByTimeAsync(500);

      // Expect rollback
      expect(usePlantsStore.getState().plants[0].x).toBe(originalX);
      expect(usePlantsStore.getState().plants[0].y).toBe(originalY);
    });
  });

  describe('updateZLayer', () => {
    const mockPlant2: Plant = { ...mockPlant, id: 'plant2', zLayer: 1 };
    const mockPlant3: Plant = { ...mockPlant, id: 'plant3', zLayer: 2 };

    beforeEach(() => {
      usePlantsStore.setState({ plants: [mockPlant, mockPlant2, mockPlant3] });
    });

    it('should update a plant\'s zLayer', async () => {
      const newZLayer = 5;
      usePlantsStore.getState().updateZLayer('plant1', newZLayer);
      expect(usePlantsStore.getState().plants.find(p => p.id === 'plant1')?.zLayer).toBe(newZLayer);
      vi.advanceTimersByTime(500);
      expect(PlantPresenter.updatePlantZLayer).toHaveBeenCalledWith(
        'plant1',
        expect.objectContaining({ zLayer: newZLayer })
      );
    });

    it('should reorder plants by zLayer when a plant is brought to front', () => {
      usePlantsStore.getState().bringToFront('plant1');

      const plants = usePlantsStore.getState().plants;
      const plant1 = plants.find(p => p.id === 'plant1');

      expect(plant1?.zLayer).toBe(2);
      expect(plants.find(p => p.id === 'plant2')?.zLayer).toBe(0);
      expect(plants.find(p => p.id === 'plant3')?.zLayer).toBe(1);

      // Check the order in the array implicitly by zLayer
      const sortedPlants = [...plants].sort((a, b) => a.zLayer - b.zLayer);
      expect(sortedPlants[0].id).toBe('plant2');
      expect(sortedPlants[1].id).toBe('plant3');
      expect(sortedPlants[2].id).toBe('plant1');
    });

    it('should reorder plants by zLayer when a plant is sent to back', () => {
      usePlantsStore.getState().sendToBack('plant3');

      const plants = usePlantsStore.getState().plants;
      const plant3 = plants.find(p => p.id === 'plant3');

      expect(plant3?.zLayer).toBe(0);
      expect(plants.find(p => p.id === 'plant1')?.zLayer).toBe(1);
      expect(plants.find(p => p.id === 'plant2')?.zLayer).toBe(2);

      // Check the order in the array implicitly by zLayer
      const sortedPlants = [...plants].sort((a, b) => a.zLayer - b.zLayer);
      expect(sortedPlants[0].id).toBe('plant3');
      expect(sortedPlants[1].id).toBe('plant1');
      expect(sortedPlants[2].id).toBe('plant2');
    });

    it('should not reorder if bringToFront is called on already front-most plant', () => {
      const initialZLayers = usePlantsStore.getState().plants.map(p => p.zLayer);
      usePlantsStore.getState().bringToFront('plant3'); // plant3 is already front-most
      const currentZLayers = usePlantsStore.getState().plants.map(p => p.zLayer);
      expect(currentZLayers).toEqual(initialZLayers);
    });

    it('should not reorder if sendToBack is called on already back-most plant', () => {
      const initialZLayers = usePlantsStore.getState().plants.map(p => p.zLayer);
      usePlantsStore.getState().sendToBack('plant1'); // plant1 is already back-most
      const currentZLayers = usePlantsStore.getState().plants.map(p => p.zLayer);
      expect(currentZLayers).toEqual(initialZLayers);
    });
  });
});
