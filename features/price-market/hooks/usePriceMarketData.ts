"use client";

import { useQuery } from "@tanstack/react-query";

import { useOddMakiClient } from "@/lib/oddmaki/hooks";
import { queryKeys } from "@/lib/oddmaki/queryKeys";

/**
 * Fetch price market data for a given market.
 *
 * Returns `isPriceMarket`, the on-chain `data`, `canResolve`, and — for
 * deferred Up/Down markets that have reached `openTime` but not yet resolved —
 * a `projectedOpenPrice` derived from Hermes using the same rule the contract
 * will apply at resolution. The UI uses `projectedOpenPrice` as the strike
 * value while `data.strikePrice` is still 0.
 *
 * `projectedOpenPrice.canonical === true` means the open window has fully
 * elapsed and the value will not change before resolution. While `false`, the
 * UI should render the projected strike with a "pending" hint.
 */
export function usePriceMarketData(marketId: bigint) {
  const client = useOddMakiClient();

  return useQuery({
    queryKey: queryKeys.priceMarket.detail(marketId),
    queryFn: async () => {
      const isPM = await client.priceMarket.isPriceMarket(marketId);

      if (!isPM) {
        return {
          isPriceMarket: false as const,
          data: null,
          canResolve: false,
          projectedOpenPrice: null,
        };
      }

      const [data, canResolve] = await Promise.all([
        client.priceMarket.get(marketId),
        client.priceMarket.canResolve(marketId),
      ]);

      // Only call Hermes for deferred Up/Down markets that haven't resolved.
      // The helper itself short-circuits to null for resolved/strike/pre-openTime
      // markets but we skip the network call entirely when we already know it
      // would return null.
      const isDeferredPending =
        !data.resolved && data.strikePrice === BigInt(0);

      const projectedOpenPrice = isDeferredPending
        ? await client.priceMarket
            .fetchProjectedOpenPrice(marketId)
            .catch(() => null)
        : null;

      return {
        isPriceMarket: true as const,
        data,
        canResolve,
        projectedOpenPrice,
      };
    },
    staleTime: 10_000,
    refetchInterval: 15_000,
  });
}
