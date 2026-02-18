import { useQuery } from '@tanstack/react-query';
import { fetchOGMetadata, extractUrl } from '../utils/ogMetadata';

/**
 * Fetches OG metadata for the first URL found in a text string.
 * Results are cached for 24 hours.
 */
export function useLinkPreview(text: string | undefined) {
  const url = text ? extractUrl(text) : null;

  return useQuery({
    queryKey: ['linkPreview', url],
    queryFn: () => fetchOGMetadata(url!),
    enabled: !!url,
    staleTime: Infinity,
    gcTime: 24 * 60 * 60 * 1000, // 24h cache
    retry: false,
  });
}
