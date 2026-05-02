"use client";

import type { FlowStep } from "@/lib/oddmaki/useTransactionFlow";

import { useCallback } from "react";
import { usePublicClient } from "wagmi";

import { useOddMakiClient } from "@/lib/oddmaki/hooks";
import { queryKeys } from "@/lib/oddmaki/queryKeys";
import { useTransactionFlow } from "@/lib/oddmaki/useTransactionFlow";

interface MatchOrdersParams {
  marketId: string;
  maxSteps?: number;
}

export function useMatchOrders() {
  const client = useOddMakiClient();
  const publicClient = usePublicClient();

  const flow = useTransactionFlow({
    invalidateKeys: [
      queryKeys.orderbook.all,
      queryKeys.orders.all,
      queryKeys.positions.all,
      queryKeys.balance.all,
      queryKeys.trades.all,
    ],
  });

  const startMatchOrders = useCallback(
    async (params: MatchOrdersParams) => {
      if (!publicClient) return;

      const marketIdBig = BigInt(params.marketId);
      const maxSteps = BigInt(params.maxSteps ?? 10);

      const steps: FlowStep[] = [
        {
          id: "match-orders",
          label: "Match Orders",
          execute: async () => {
            const hash = await client.trade.matchOrders({
              marketId: marketIdBig,
              maxSteps,
            });

            await publicClient.waitForTransactionReceipt({ hash });
          },
        },
      ];

      await flow.start(steps);
    },
    [client, publicClient, flow],
  );

  return { startMatchOrders, flow };
}
