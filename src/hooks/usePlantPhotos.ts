import { QueryClient, useQuery } from '@tanstack/react-query';
import { photoRepo } from '../services';

const queryClient = new QueryClient();

export const plantPhotoKeys = {
  all: ['plantPhotos'] as const,
  lists: (plantId: string) => [...plantPhotoKeys.all, 'list', plantId] as const,
};

export function usePlantPhotos(plantId: string) {
  return useQuery({
    queryKey: plantPhotoKeys.lists(plantId),
    queryFn: () => photoRepo.getPlantPhotos(plantId),
    enabled: !!plantId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function invalidatePlantPhotos(plantId: string) {
  queryClient.invalidateQueries({ queryKey: plantPhotoKeys.lists(plantId) });
}
