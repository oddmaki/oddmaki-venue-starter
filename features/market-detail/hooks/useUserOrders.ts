"use client";

import type { Address } from "viem";

import { useQuery } from "@tanstack/react-query";
import { useConnection } from "wagmi";

import { useOddMakiClient } from "@/lib/oddmaki/hooks";
import { queryKeys } from "@/lib/oddmaki/queryKeys";

export interface SubgraphOrder {
  id: string;
  orderId: string;
  outcome: string;
  side: string;
  tick: string;
  amount: string;
  filled: string;
  status: string;
  trader: string;
  createdAt: string;
}

/**
 * Hook to fetch the user's active orders for a market from the subgraph.
 */
export function useUserOrders(marketId: string) {
  const client = useOddMakiClient();
  const { address } = useConnection();

  return useQuery<SubgraphOrder[]>({
    queryKey: queryKeys.orders.byMarketUser(marketId, address as Address),
    queryFn: async () => {
      const result = (await client.public.getOrders({
        marketId: BigInt(marketId),
        first: 100,
      })) as any;
      const rawOrders: any[] = result.orders || [];

      // Flatten nested fields and filter to this user's orders
      return rawOrders
        .filter(
          (o) => o.trader?.address?.toLowerCase() === address!.toLowerCase(),
        )
        .map((o) => ({
          id: o.id,
          orderId: o.orderId,
          outcome: o.outcome,
          side: o.side,
          tick: o.tick,
          amount: o.amount,
          filled: o.filled,
          status: o.status,
          trader: o.trader?.address ?? "",
          createdAt: o.createdAt,
        }));
    },
    enabled: !!address && !!marketId,
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}
