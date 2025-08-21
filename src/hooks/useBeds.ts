import { QueryClient, useQuery } from '@tanstack/react-query';
import { bedRepo } from '../services';

const queryClient = new QueryClient();

export const bedKeys = {
  all: ['beds'] as const,
  lists: () => [...bedKeys.all, 'list'] as const,
  detail: (id: string) => [...bedKeys.all, 'detail', id] as const,
};

export function useBeds() {
  return useQuery({
    queryKey: bedKeys.lists(),
    queryFn: () => bedRepo.listBeds(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function invalidateBeds() {
  queryClient.invalidateQueries({ queryKey: bedKeys.lists() });
}
