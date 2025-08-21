import { useQuery } from '@tanstack/react-query';
import { photoRepo } from '../services';

export const photoKeys = {
  all: ['photos'] as const,
  plantPhotos: (plantId: string) => [...photoKeys.all, 'plant', plantId] as const,
  bedPhotos: (bedId: string) => [...photoKeys.all, 'bed', bedId] as const,
};

export function usePlantPhotos(plantId: string) {
  return useQuery({
    queryKey: photoKeys.plantPhotos(plantId),
    queryFn: () => photoRepo.getPlantPhotos(plantId),
    enabled: !!plantId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useBedPhotos(bedId: string) {
  return useQuery({
    queryKey: photoKeys.bedPhotos(bedId),
    queryFn: () => photoRepo.getBedPhotos(bedId),
    enabled: !!bedId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}
