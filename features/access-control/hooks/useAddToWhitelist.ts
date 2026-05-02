"use client";

import { useOddMakiClient } from "@/lib/oddmaki/hooks";
import { useTransaction } from "@/lib/oddmaki/useTransaction";
import { queryKeys } from "@/lib/oddmaki/queryKeys";

export function useAddToWhitelist(acContract: `0x${string}` | undefined) {
  const client = useOddMakiClient();

  const { execute, isLoading, error } = useTransaction({
    pendingMessage: "Adding to whitelist...",
    successMessage: "Addresses added to whitelist",
    errorMessage: "Failed to add to whitelist",
    invalidateKeys: [queryKeys.accessControl.all],
  });

  const addToWhitelist = async (users: `0x${string}`[]) => {
    if (!acContract) return;

    return execute(() =>
      client.accessControl.addToWhitelist({ acContract, users }),
    );
  };

  return { addToWhitelist, isLoading, error };
}
