import { create } from 'zustand';
import { Bed } from '../domain/ports';
import { SupabaseBedRepo } from '../services/db/SupabaseBedRepo';

interface BedsState {
  // State
  beds: Bed[];
  selectedBed: Bed | null;

  // Actions
  createBed: (bedData: { name: string; base_image_url?: string }) => Promise<Bed>;
  updateBed: (id: string, updates: Partial<Bed>) => Promise<Bed>;
  deleteBed: (id: string) => Promise<void>;
  selectBed: (bed: Bed | null) => void;

  // Data management helpers
  hydrate: (beds: Bed[]) => void;
  replaceData: (beds: Bed[]) => void;
}

const bedRepo = new SupabaseBedRepo();

export const useBedsStore = create<BedsState>((set, get) => ({
  // Initial state
  beds: [],
  selectedBed: null,

  // Actions
  createBed: async (bedData) => {
    const newBed = await bedRepo.create(bedData);
    
    // Update local state
    const currentBeds = get().beds;
    set({ beds: [...currentBeds, newBed] });

    return newBed;
  },

  updateBed: async (id: string, updates) => {
    const updatedBed = await bedRepo.update(id, updates);

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
  },

  deleteBed: async (id: string) => {
    await bedRepo.delete(id);

    // Update local state
    const currentBeds = get().beds;
    const filteredBeds = currentBeds.filter(bed => bed.id !== id);
    set({ beds: filteredBeds });

    // Clear selected bed if it was deleted
    const selectedBed = get().selectedBed;
    if (selectedBed?.id === id) {
      set({ selectedBed: null });
    }
  },

  selectBed: (bed: Bed | null) => {
    set({ selectedBed: bed });
  },

  // Data management helpers
  hydrate: (beds: Bed[]) => {
    set({ beds, selectedBed: null });
  },

  replaceData: (beds: Bed[]) => {
    set({ beds, selectedBed: null });
  },
}));
