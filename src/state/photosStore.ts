import { create } from 'zustand';
import { BedPhoto, PlantPhoto } from '../domain/ports';
import { SupabasePhotoRepo } from '../services/db/SupabasePhotoRepo';

interface PhotosState {
  // State
  plantPhotos: Record<string, PlantPhoto[]>; // keyed by plant_id
  bedPhotos: Record<string, BedPhoto[]>; // keyed by bed_id

  // Actions
  addPlantPhoto: (photoData: Omit<PlantPhoto, 'id' | 'captured_on'>) => Promise<PlantPhoto>;
  addBedPhoto: (photoData: Omit<BedPhoto, 'id' | 'captured_on'>) => Promise<BedPhoto>;
  deletePhoto: (id: string, type: 'plant' | 'bed', entityId: string) => Promise<void>;

  // Selectors
  getPlantPhotos: (plantId: string) => PlantPhoto[];
  getBedPhotos: (bedId: string) => BedPhoto[];

  // Data management helpers
  hydrate: (plantPhotos: Record<string, PlantPhoto[]>, bedPhotos: Record<string, BedPhoto[]>) => void;
  replaceData: (plantPhotos: Record<string, PlantPhoto[]>, bedPhotos: Record<string, BedPhoto[]>) => void;
}

const photoRepo = new SupabasePhotoRepo();

export const usePhotosStore = create<PhotosState>((set, get) => ({
  // Initial state
  plantPhotos: {},
  bedPhotos: {},

  // Actions
  addPlantPhoto: async (photoData) => {
    const newPhoto = await photoRepo.addPlantPhoto(photoData);
    
    // Update local state
    const currentPlantPhotos = get().plantPhotos;
    const plantId = photoData.plant_id;
    const existingPhotos = currentPlantPhotos[plantId] || [];
    
    set({ 
      plantPhotos: {
        ...currentPlantPhotos,
        [plantId]: [...existingPhotos, newPhoto]
      }
    });

    return newPhoto;
  },

  addBedPhoto: async (photoData) => {
    const newPhoto = await photoRepo.addBedPhoto(photoData);
    
    // Update local state
    const currentBedPhotos = get().bedPhotos;
    const bedId = photoData.bed_id;
    const existingPhotos = currentBedPhotos[bedId] || [];
    
    set({ 
      bedPhotos: {
        ...currentBedPhotos,
        [bedId]: [...existingPhotos, newPhoto]
      }
    });

    return newPhoto;
  },

  deletePhoto: async (id: string, type: 'plant' | 'bed', entityId: string) => {
    await photoRepo.deletePhoto(id);

    // Update local state based on type
    if (type === 'plant') {
      const currentPlantPhotos = get().plantPhotos;
      const updatedPhotos = (currentPlantPhotos[entityId] || []).filter(p => p.id !== id);
      set({ 
        plantPhotos: {
          ...currentPlantPhotos,
          [entityId]: updatedPhotos
        }
      });
    } else {
      const currentBedPhotos = get().bedPhotos;
      const updatedPhotos = (currentBedPhotos[entityId] || []).filter(p => p.id !== id);
      set({ 
        bedPhotos: {
          ...currentBedPhotos,
          [entityId]: updatedPhotos
        }
      });
    }
  },

  // Selectors
  getPlantPhotos: (plantId: string) => {
    const { plantPhotos } = get();
    return plantPhotos[plantId] || [];
  },

  getBedPhotos: (bedId: string) => {
    const { bedPhotos } = get();
    return bedPhotos[bedId] || [];
  },

  // Data management helpers
  hydrate: (plantPhotos: Record<string, PlantPhoto[]>, bedPhotos: Record<string, BedPhoto[]>) => {
    set({ plantPhotos, bedPhotos });
  },

  replaceData: (plantPhotos: Record<string, PlantPhoto[]>, bedPhotos: Record<string, BedPhoto[]>) => {
    set({ plantPhotos, bedPhotos });
  },
}));
