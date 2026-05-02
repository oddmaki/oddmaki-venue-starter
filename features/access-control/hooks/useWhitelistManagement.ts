"use client";

import { useCallback } from "react";
import { usePublicClient } from "wagmi";

import { useOddMakiClient } from "@/lib/oddmaki/hooks";

/**
 * Hook for managing a WhitelistAccessControl contract (add/remove users).
 */
export function useWhitelistManagement() {
  const client = useOddMakiClient();
  const publicClient = usePublicClient();

  const addToWhitelist = useCallback(
    async (acContract: `0x${string}`, users: `0x${string}`[]) => {
      if (!publicClient) throw new Error("Public client not available");
      const hash = await client.accessControl.addToWhitelist({
        acContract,
        users,
      });

      await publicClient.waitForTransactionReceipt({ hash });
    },
    [client, publicClient],
  );

  const removeFromWhitelist = useCallback(
    async (acContract: `0x${string}`, users: `0x${string}`[]) => {
      if (!publicClient) throw new Error("Public client not available");
      const hash = await client.accessControl.removeFromWhitelist({
        acContract,
        users,
      });

      await publicClient.waitForTransactionReceipt({ hash });
    },
    [client, publicClient],
  );

  const isWhitelisted = useCallback(
    async (
      acContract: `0x${string}`,
      user: `0x${string}`,
    ): Promise<boolean> => {
      return client.accessControl.isWhitelisted({ acContract, user });
    },
    [client],
  );

  return { addToWhitelist, removeFromWhitelist, isWhitelisted };
}
