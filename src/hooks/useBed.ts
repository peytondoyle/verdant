import { QueryClient, useQuery } from '@tanstack/react-query';
import { plantRepo } from '../services';
import { SupabaseBedRepo } from '../services/db/SupabaseBedRepo';

const queryClient = new QueryClient();

export const bedKeys = {
  all: ['beds'] as const,
  detail: (id: string) => [...bedKeys.all, 'detail', id] as const,
};

export function useBed(bedId: string) {
  return useQuery({
    queryKey: ['bed', bedId],
    queryFn: async () => {
      const bed = await new SupabaseBedRepo().getBed(bedId);
      if (!bed) {
        throw new Error('Bed not found');
      }
      const plants = await plantRepo.getPlantsForBed(bedId);
      return { bed, plants };
    },
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function invalidateBed(id: string) {
  queryClient.invalidateQueries({ queryKey: bedKeys.detail(id) });
}
