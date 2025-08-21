import { create } from 'zustand';
import { BedPhoto, Photo, PhotoRepo, PlantPhoto } from '../domain/ports';
import { SupabasePhotoRepo } from '../services/db/SupabasePhotoRepo';

interface PhotosState {
  // State
  plantPhotos: Record<string, PlantPhoto[]>; // keyed by plant_id
  bedPhotos: Record<string, BedPhoto[]>; // keyed by bed_id
  allPhotos: Photo[];
  loading: boolean;
  error: string | null;

  // Dependencies
  photoRepo: PhotoRepo;

  // Actions
  loadPlantPhotos: (plantId: string) => Promise<void>;
  loadBedPhotos: (bedId: string) => Promise<void>;
  addPlantPhoto: (photoData: Omit<PlantPhoto, 'id' | 'captured_on'>) => Promise<PlantPhoto>;
  addBedPhoto: (photoData: Omit<BedPhoto, 'id' | 'captured_on'>) => Promise<BedPhoto>;
  deletePhoto: (id: string, type: 'plant' | 'bed', entityId: string) => Promise<void>;
  clearError: () => void;

  // Selectors
  getPlantPhotos: (plantId: string) => PlantPhoto[];
  getBedPhotos: (bedId: string) => BedPhoto[];

  // Data management helpers
  hydrate: (plantPhotos: Record<string, PlantPhoto[]>, bedPhotos: Record<string, BedPhoto[]>) => void;
  replaceData: (plantPhotos: Record<string, PlantPhoto[]>, bedPhotos: Record<string, BedPhoto[]>) => void;
}

export const usePhotosStore = create<PhotosState>((set, get) => ({
  // Initial state
  plantPhotos: {},
  bedPhotos: {},
  allPhotos: [],
  loading: false,
  error: null,

  // Dependencies
  photoRepo: new SupabasePhotoRepo(),

  // Actions
  loadPlantPhotos: async (plantId: string) => {
    set({ loading: true, error: null });
    try {
      const photos = await get().photoRepo.getPlantPhotos(plantId);
      
      // Update local state
      const currentPlantPhotos = get().plantPhotos;
      set({ 
        plantPhotos: {
          ...currentPlantPhotos,
          [plantId]: photos
        }
      });

      // Update allPhotos array
      const currentAllPhotos = get().allPhotos;
      const otherPhotos = currentAllPhotos.filter(p => 
        !('plant_id' in p) || (p as PlantPhoto).plant_id !== plantId
      );
      set({ allPhotos: [...otherPhotos, ...photos] });
      
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to load plant photos' });
    } finally {
      set({ loading: false });
    }
  },

  loadBedPhotos: async (bedId: string) => {
    set({ loading: true, error: null });
    try {
      const photos = await get().photoRepo.getBedPhotos(bedId);
      
      // Update local state
      const currentBedPhotos = get().bedPhotos;
      set({ 
        bedPhotos: {
          ...currentBedPhotos,
          [bedId]: photos
        }
      });

      // Update allPhotos array
      const currentAllPhotos = get().allPhotos;
      const otherPhotos = currentAllPhotos.filter(p => 
        !('bed_id' in p) || (p as BedPhoto).bed_id !== bedId
      );
      set({ allPhotos: [...otherPhotos, ...photos] });
      
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to load bed photos' });
    } finally {
      set({ loading: false });
    }
  },

  addPlantPhoto: async (photoData) => {
    set({ loading: true, error: null });
    try {
      const newPhoto = await get().photoRepo.addPlantPhoto(photoData);
      
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

      // Update allPhotos array
      const currentAllPhotos = get().allPhotos;
      set({ allPhotos: [...currentAllPhotos, newPhoto] });

      return newPhoto;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to add plant photo' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  addBedPhoto: async (photoData) => {
    set({ loading: true, error: null });
    try {
      const newPhoto = await get().photoRepo.addBedPhoto(photoData);
      
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

      // Update allPhotos array
      const currentAllPhotos = get().allPhotos;
      set({ allPhotos: [...currentAllPhotos, newPhoto] });

      return newPhoto;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to add bed photo' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deletePhoto: async (id: string, type: 'plant' | 'bed', entityId: string) => {
    set({ loading: true, error: null });
    try {
      await get().photoRepo.deletePhoto(id);

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

      // Update allPhotos array
      const currentAllPhotos = get().allPhotos;
      const filteredPhotos = currentAllPhotos.filter(p => p.id !== id);
      set({ allPhotos: filteredPhotos });

    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete photo' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  clearError: () => {
    set({ error: null });
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
    // Combine all photos for the allPhotos array
    const allPhotos: Photo[] = [
      ...Object.values(plantPhotos).flat(),
      ...Object.values(bedPhotos).flat()
    ];

    set({ plantPhotos, bedPhotos, allPhotos, loading: false, error: null });
  },

  replaceData: (plantPhotos: Record<string, PlantPhoto[]>, bedPhotos: Record<string, BedPhoto[]>) => {
    // Combine all photos for the allPhotos array
    const allPhotos: Photo[] = [
      ...Object.values(plantPhotos).flat(),
      ...Object.values(bedPhotos).flat()
    ];

    set({ plantPhotos, bedPhotos, allPhotos, loading: false, error: null });
  },
}));
