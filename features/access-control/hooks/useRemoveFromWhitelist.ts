"use client";

import { useOddMakiClient } from "@/lib/oddmaki/hooks";
import { useTransaction } from "@/lib/oddmaki/useTransaction";
import { queryKeys } from "@/lib/oddmaki/queryKeys";

export function useRemoveFromWhitelist(acContract: `0x${string}` | undefined) {
  const client = useOddMakiClient();

  const { execute, isLoading, error } = useTransaction({
    pendingMessage: "Removing from whitelist...",
    successMessage: "Addresses removed from whitelist",
    errorMessage: "Failed to remove from whitelist",
    invalidateKeys: [queryKeys.accessControl.all],
  });

  const removeFromWhitelist = async (users: `0x${string}`[]) => {
    if (!acContract) return;

    return execute(() =>
      client.accessControl.removeFromWhitelist({ acContract, users }),
    );
  };

  return { removeFromWhitelist, isLoading, error };
}
