import { QueryClient, useQuery } from '@tanstack/react-query';
import { photoRepo } from '../services';

const queryClient = new QueryClient();

export const bedPhotoKeys = {
  all: ['bedPhotos'] as const,
  lists: (bedId: string) => [...bedPhotoKeys.all, 'list', bedId] as const,
};

export function useBedPhotos(bedId: string) {
  return useQuery({
    queryKey: bedPhotoKeys.lists(bedId),
    queryFn: () => photoRepo.getBedPhotos(bedId),
    enabled: !!bedId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function invalidateBedPhotos(bedId: string) {
  queryClient.invalidateQueries({ queryKey: bedPhotoKeys.lists(bedId) });
}
