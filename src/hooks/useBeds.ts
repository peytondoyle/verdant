import { useQuery } from '@tanstack/react-query';
import { bedRepo } from '../services';

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
    cacheTime: 1000 * 60 * 10, // 10 minutes
  });
}
