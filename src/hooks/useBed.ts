import { useQuery } from '@tanstack/react-query';
import { bedRepo, plantRepo } from '../services';

export const bedKeys = {
  all: ['beds'] as const,
  detail: (id: string) => [...bedKeys.all, 'detail', id] as const,
};

export function useBed(id: string) {
  return useQuery({
    queryKey: bedKeys.detail(id),
    queryFn: async () => {
      const bed = await bedRepo.getBed(id);
      const plants = await plantRepo.listPlantsForBed(id);
      return { bed, plants };
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
  });
}
