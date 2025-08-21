import { useQuery, useQueryClient } from '@tanstack/react-query';
import { plantRepo } from '../services';

export const plantKeys = {
  all: ['plants'] as const,
  lists: (bedId: string) => [...plantKeys.all, 'list', bedId] as const,
  detail: (id: string) => [...plantKeys.all, 'detail', id] as const,
};

export function usePlants(bedId: string) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: plantKeys.lists(bedId),
    queryFn: () => plantRepo.listPlants(bedId),
    enabled: !!bedId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
    onSuccess: (data) => {
      // Invalidate specific plant detail queries if the list changes
      data.forEach(plant => {
        queryClient.invalidateQueries({ queryKey: plantKeys.detail(plant.id) });
      });
    },
  });
}

export function usePlant(id: string) {
  return useQuery({
    queryKey: plantKeys.detail(id),
    queryFn: () => plantRepo.getPlant(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 10,
  });
}
