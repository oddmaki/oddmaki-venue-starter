"use client";

import { useQuery } from "@tanstack/react-query";
import { resolveIPFSUri } from "@oddmaki-protocol/sdk";

/**
 * Fetch and parse JSON metadata from an IPFS URI or HTTP URL.
 * Uses TanStack Query for caching and loading state management.
 *
 * @param uri - IPFS URI (ipfs://...) or HTTP URL, or undefined/null to skip
 * @returns { data, isLoading, error } with typed metadata
 */
export function useMetadata<T>(uri: string | undefined | null) {
  return useQuery<T | null>({
    queryKey: ["metadata", uri],
    queryFn: async () => {
      if (!uri) return null;
      const url = resolveIPFSUri(uri, process.env.NEXT_PUBLIC_IPFS_GATEWAY);

      if (!url) return null;

      const response = await fetch(url);

      if (!response.ok) return null;

      const json = await response.json();

      return json as T;
    },
    enabled: !!uri,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}
