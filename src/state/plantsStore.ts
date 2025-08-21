import { create } from 'zustand';
import { Plant } from '../domain/ports';
import { debounce } from '../lib/utils'; // Import the debounce utility
import { SupabasePlantRepo } from '../services/db/SupabasePlantRepo';

interface PlantsState {
  // State
  plants: Plant[];
  plantsByBed: Record<string, Plant[]>;
  selectedPlant: Plant | null;

  // Actions
  createPlant: (plantData: Omit<Plant, 'id' | 'created_at'> & { bed_id: string; x: number; y: number; z_layer: number; sprite_url?: string }) => Promise<Plant>;
  updatePlant: (id: string, updates: Partial<Plant>) => Promise<Plant>;
  deletePlant: (id: string) => Promise<void>;
  selectPlant: (plant: Plant | null) => void;
  updatePosition: (id: string, newPosition: { x: number; y: number }) => void; // New action
  updateZLayer: (id: string, newZLayer: number) => void; // New action

  // Selectors
  getPlantsForBed: (bedId: string) => Plant[];

  // Data management helpers
  hydrate: (plants: Plant[]) => void;
  replaceData: (plants: Plant[]) => void;
}

const plantRepo = new SupabasePlantRepo();

export const usePlantsStore = create<PlantsState>((set, get) => {
  const debouncedUpdatePlant = debounce(async (id: string, updates: Partial<Plant>) => {
    try {
      await plantRepo.update(id, updates);
    } catch {
      // Rollback on error
      set(state => {
        const plants = state.plants.map(p =>
          p.id === id ? { ...p, ...state.plants.find(oldP => oldP.id === id) } : p
        );
        return { plants };
      });
    }
  }, 300);

  return {
    // Initial state
    plants: [],
    plantsByBed: {},
    selectedPlant: null,

    // Actions
    createPlant: async (plantData) => {
      const newPlant = await plantRepo.create(plantData);
      
      // Update local state
      set(state => ({
        plants: [...state.plants, newPlant],
        plantsByBed: { ...state.plantsByBed, [newPlant.bed_id!]: [...(state.plantsByBed[newPlant.bed_id!] || []), newPlant] }
      }));

      return newPlant;
    },

    updatePlant: async (id: string, updates) => {
      const updatedPlant = await plantRepo.update(id, updates);

      // Update local state
      set(state => ({
        plants: state.plants.map(plant => plant.id === id ? updatedPlant : plant),
        plantsByBed: Object.fromEntries(
          Object.entries(state.plantsByBed).map(([bedId, plants]) => [
            bedId,
            plants.map(plant => plant.id === id ? updatedPlant : plant)
          ])
        ),
        selectedPlant: state.selectedPlant?.id === id ? updatedPlant : state.selectedPlant,
      }));

      return updatedPlant;
    },

    deletePlant: async (id: string) => {
      await plantRepo.delete(id);

      // Update local state
      set(state => ({
        plants: state.plants.filter(plant => plant.id !== id),
        plantsByBed: Object.fromEntries(
          Object.entries(state.plantsByBed).map(([bedId, plants]) => [
            bedId,
            plants.filter(plant => plant.id !== id)
          ])
        ),
        selectedPlant: state.selectedPlant?.id === id ? null : state.selectedPlant,
      }));
    },

    selectPlant: (plant: Plant | null) => {
      set({ selectedPlant: plant });
    },

    updatePosition: (id: string, newPosition: { x: number; y: number }) => {
      set(state => {
        const originalPlant = state.plants.find(p => p.id === id);
        if (!originalPlant) return state;

        // Optimistic update
        const updatedPlants = state.plants.map(plant =>
          plant.id === id ? { ...plant, x: newPosition.x, y: newPosition.y } : plant
        );

        // Update plantsByBed mapping
        const updatedPlantsByBed = { ...state.plantsByBed };
        Object.keys(updatedPlantsByBed).forEach(bedId => {
          updatedPlantsByBed[bedId] = updatedPlantsByBed[bedId].map(plant =>
            plant.id === id ? { ...plant, x: newPosition.x, y: newPosition.y } : plant
          );
        });

        debouncedUpdatePlant(id, newPosition);
        return { plants: updatedPlants, plantsByBed: updatedPlantsByBed };
      });
    },

    updateZLayer: (id: string, newZLayer: number) => {
      set(state => {
        const originalPlant = state.plants.find(p => p.id === id);
        if (!originalPlant) return state;

        // Optimistic update
        const updatedPlants = state.plants.map(plant =>
          plant.id === id ? { ...plant, z_layer: newZLayer } : plant
        );

        // Update plantsByBed mapping
        const updatedPlantsByBed = { ...state.plantsByBed };
        Object.keys(updatedPlantsByBed).forEach(bedId => {
          updatedPlantsByBed[bedId] = updatedPlantsByBed[bedId].map(plant =>
            plant.id === id ? { ...plant, z_layer: newZLayer } : plant
          );
        });

        debouncedUpdatePlant(id, { z_layer: newZLayer });
        return { plants: updatedPlants, plantsByBed: updatedPlantsByBed };
      });
    },

    // Selectors
    getPlantsForBed: (bedId: string) => {
      const { plantsByBed } = get();
      return plantsByBed[bedId] || [];
    },

    // Data management helpers
    hydrate: (plants: Plant[]) => {
      // Group plants by bed for quick lookup
      const plantsByBed: Record<string, Plant[]> = {};
      plants.forEach(plant => {
        const bedId = (plant as any).bed_id; // TypeScript workaround - bed_id not in Plant interface but needed
        if (bedId) {
          if (!plantsByBed[bedId]) {
            plantsByBed[bedId] = [];
          }
          plantsByBed[bedId].push(plant);
        }
      });

      set({ plants, plantsByBed });
    },

    replaceData: (plants: Plant[]) => {
      // Group plants by bed for quick lookup
      const plantsByBed: Record<string, Plant[]> = {};
      plants.forEach(plant => {
        const bedId = (plant as any).bed_id; // TypeScript workaround
        if (bedId) {
          if (!plantsByBed[bedId]) {
            plantsByBed[bedId] = [];
          }
          plantsByBed[bedId].push(plant);
        }
      });

      set({ plants, plantsByBed, selectedPlant: null });
    },
  };
});
