"use client";

import { useOddMakiClient } from "@/lib/oddmaki/hooks";
import { useTransaction } from "@/lib/oddmaki/useTransaction";
import { queryKeys } from "@/lib/oddmaki/queryKeys";

export function useUpdateMarketTags(marketId: string) {
  const client = useOddMakiClient();

  const { execute, isLoading, error } = useTransaction({
    pendingMessage: "Updating market tags...",
    successMessage: "Market tags updated!",
    errorMessage: "Failed to update tags",
    invalidateKeys: [queryKeys.markets.detail(marketId)],
  });

  const updateTags = async (tags: string[]) => {
    return execute(() =>
      client.market.updateMarketTags({
        marketId: BigInt(marketId),
        tags,
      }),
    );
  };

  return { updateTags, isLoading, error };
}
