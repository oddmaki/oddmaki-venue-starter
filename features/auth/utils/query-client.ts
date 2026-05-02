/**
 * Shared QueryClient
 *
 * Single QueryClient instance shared across all auth provider adapters.
 * Extracted from providers.tsx so each adapter doesn't create its own.
 */

import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
