import { Plant } from '../domain/ports';

export interface PlantPresenter {
  id: string;
  name: string;
  type: 'Perennial' | 'Annual' | 'Edible';
  plantedOn: string; // Formatted date string
  notes?: string;
  imageUrl: string;
  x: number;
  y: number;
  z: number;
};

export const mapPlant = (plant: Plant): PlantPresenter => {
  return {
    id: plant.id,
    name: plant.name,
    type: plant.type,
    plantedOn: plant.planted_on.toLocaleDateString(),
    notes: plant.notes,
    imageUrl: plant.sprite_url,
    x: plant.x,
    y: plant.y,
    z: plant.z_layer,
  };
};
