import { Photo } from '../domain/ports';

export interface PhotoPresenter {
  id: string;
  imageUrl: string;
  capturedOn: string; // Formatted date string
  notes?: string;
};

export const mapPhotos = (photos: Photo[]): PhotoPresenter[] => {
  // Sort photos by captured_on in descending order (most recent first)
  const sortedPhotos = [...photos].sort((a, b) => b.captured_on.getTime() - a.captured_on.getTime());

  return sortedPhotos.map(photo => ({
    id: photo.id,
    imageUrl: photo.image_url,
    capturedOn: photo.captured_on.toLocaleDateString(),
    notes: photo.notes,
  }));
};
