import { Bed } from '../domain/ports';

export interface BedPresenter {
  id: string;
  name: string;
  imageUrl?: string;
};

export const mapBed = (bed: Bed): BedPresenter => {
  return {
    id: bed.id,
    name: bed.name,
    imageUrl: bed.base_image_url ?? undefined, // Convert null → undefined for UI convenience
  };
};
