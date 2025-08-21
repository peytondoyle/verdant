import { create } from 'zustand';
import { Bed, BedRepo } from '../domain/ports';
import { SupabaseBedRepo } from '../services/db/SupabaseBedRepo';

interface BedsState {
  // State
  beds: Bed[];
  selectedBed: Bed | null;
  loading: boolean;
  error: string | null;

  // Dependencies
  bedRepo: BedRepo;

  // Actions
  loadBeds: () => Promise<void>;
  getBed: (id: string) => Promise<Bed | null>;
  createBed: (bedData: { name: string; base_image_url?: string }) => Promise<Bed>;
  updateBed: (id: string, updates: Partial<Bed>) => Promise<Bed>;
  deleteBed: (id: string) => Promise<void>;
  selectBed: (bed: Bed | null) => void;
  clearError: () => void;

  // Data management helpers
  hydrate: (beds: Bed[]) => void;
  replaceData: (beds: Bed[]) => void;
}

export const useBedsStore = create<BedsState>((set, get) => ({
  // Initial state
  beds: [],
  selectedBed: null,
  loading: false,
  error: null,

  // Dependencies
  bedRepo: new SupabaseBedRepo(),

  // Actions
  loadBeds: async () => {
    set({ loading: true, error: null });
    try {
      const beds = await get().bedRepo.listBeds();
      set({ beds });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to load beds' });
    } finally {
      set({ loading: false });
    }
  },

  getBed: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const bed = await get().bedRepo.getBed(id);
      if (bed) {
        // Update the bed in local state if it exists
        const currentBeds = get().beds;
        const bedIndex = currentBeds.findIndex(b => b.id === id);
        if (bedIndex >= 0) {
          const updatedBeds = [...currentBeds];
          updatedBeds[bedIndex] = bed;
          set({ beds: updatedBeds });
        } else {
          // Add to local state if not present
          set({ beds: [...currentBeds, bed] });
        }
      }
      return bed;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to get bed' });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  createBed: async (bedData) => {
    set({ loading: true, error: null });
    try {
      const newBed = await get().bedRepo.create(bedData);
      
      // Update local state
      const currentBeds = get().beds;
      set({ beds: [...currentBeds, newBed] });

      return newBed;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create bed' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateBed: async (id: string, updates) => {
    set({ loading: true, error: null });
    try {
      const updatedBed = await get().bedRepo.update(id, updates);

      // Update local state
      const currentBeds = get().beds;
      const updatedBeds = currentBeds.map(bed => 
        bed.id === id ? updatedBed : bed
      );
      set({ beds: updatedBeds });

      // Update selected bed if it's the one being updated
      const selectedBed = get().selectedBed;
      if (selectedBed?.id === id) {
        set({ selectedBed: updatedBed });
      }

      return updatedBed;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update bed' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteBed: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await get().bedRepo.delete(id);

      // Update local state
      const currentBeds = get().beds;
      const filteredBeds = currentBeds.filter(bed => bed.id !== id);
      set({ beds: filteredBeds });

      // Clear selected bed if it was deleted
      const selectedBed = get().selectedBed;
      if (selectedBed?.id === id) {
        set({ selectedBed: null });
      }

    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete bed' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  selectBed: (bed: Bed | null) => {
    set({ selectedBed: bed });
  },

  clearError: () => {
    set({ error: null });
  },

  // Data management helpers
  hydrate: (beds: Bed[]) => {
    set({ beds, loading: false, error: null });
  },

  replaceData: (beds: Bed[]) => {
    set({ beds, selectedBed: null, loading: false, error: null });
  },
}));
