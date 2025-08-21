import { QueryClient, useQuery } from '@tanstack/react-query';
import { plantRepo } from '../services';

const queryClient = new QueryClient();

export const plantKeys = {
  all: ['plants'] as const,
  lists: (bedId: string) => [...plantKeys.all, 'list', bedId] as const,
  detail: (id: string) => [...plantKeys.all, 'detail', id] as const,
};

export function usePlants(bedId: string) {
  return useQuery({
    queryKey: ['plants', bedId],
    queryFn: async () => {
      return plantRepo.getPlantsForBed(bedId);
    },
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function usePlant(id: string) {
  return useQuery({
    queryKey: plantKeys.detail(id),
    queryFn: () => plantRepo.getPlant(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}

export function invalidatePlants(bedId: string) {
  queryClient.invalidateQueries({ queryKey: plantKeys.lists(bedId) });
}

export function invalidatePlant(id: string) {
  queryClient.invalidateQueries({ queryKey: plantKeys.detail(id) });
}
