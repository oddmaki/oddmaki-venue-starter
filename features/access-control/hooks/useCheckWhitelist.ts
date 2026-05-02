"use client";

import { useState, useCallback } from "react";

import { useOddMakiClient } from "@/lib/oddmaki/hooks";

/**
 * Hook for checking if an address is whitelisted on demand.
 * Returns a trigger function rather than a query — invoked by user action.
 */
export function useCheckWhitelist(acContract: `0x${string}` | undefined) {
  const client = useOddMakiClient();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<boolean | null>(null);

  const checkAddress = useCallback(
    async (user: `0x${string}`) => {
      if (!acContract) return;
      setIsLoading(true);
      setResult(null);
      try {
        const allowed = await client.accessControl.isWhitelisted({
          acContract,
          user,
        });

        setResult(allowed);
      } finally {
        setIsLoading(false);
      }
    },
    [client, acContract],
  );

  const reset = useCallback(() => setResult(null), []);

  return { checkAddress, isLoading, result, reset };
}
