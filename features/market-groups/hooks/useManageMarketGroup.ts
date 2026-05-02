"use client";

import type { FlowStep } from "@/lib/oddmaki/useTransactionFlow";

import { useCallback } from "react";
import { useConnection, usePublicClient } from "wagmi";

import { useOddMakiClient } from "@/lib/oddmaki/hooks";
import { queryKeys } from "@/lib/oddmaki/queryKeys";
import { useTransactionFlow } from "@/lib/oddmaki/useTransactionFlow";

/** Wait for RPC nodes to propagate state after a confirmed transaction. */
const waitForRPCSync = (ms = 2000) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export function useAddMarketToGroup(groupId: string) {
  const client = useOddMakiClient();
  const { address } = useConnection();
  const publicClient = usePublicClient();

  const flow = useTransactionFlow({
    invalidateKeys: [
      queryKeys.marketGroups.detail(groupId),
      queryKeys.marketGroups.markets(groupId),
    ],
  });

  const execute = useCallback(
    async (marketName: string, marketQuestion: string) => {
      if (!address || !publicClient) return;

      const steps: FlowStep[] = [
        {
          id: "add-market",
          label: `Add Market: ${marketName}`,
          execute: async () => {
            await waitForRPCSync();
            const hash = await client.market.addMarketToGroup({
              marketGroupId: BigInt(groupId),
              marketName,
              marketQuestion,
            });

            await publicClient.waitForTransactionReceipt({ hash });
          },
        },
      ];

      await flow.start(steps);
    },
    [address, client, publicClient, flow, groupId],
  );

  return { execute, flow };
}

export function useAddPlaceholders(groupId: string) {
  const client = useOddMakiClient();
  const { address } = useConnection();
  const publicClient = usePublicClient();

  const flow = useTransactionFlow({
    invalidateKeys: [
      queryKeys.marketGroups.detail(groupId),
      queryKeys.marketGroups.markets(groupId),
    ],
  });

  const execute = useCallback(
    async (count: number) => {
      if (!address || !publicClient || count < 1) return;

      const steps: FlowStep[] = [
        {
          id: "add-placeholders",
          label: `Add ${count} Placeholder${count > 1 ? "s" : ""}`,
          execute: async () => {
            await waitForRPCSync();
            const hash = await client.market.addPlaceholderMarkets({
              marketGroupId: BigInt(groupId),
              count: BigInt(count),
            });

            await publicClient.waitForTransactionReceipt({ hash });
          },
        },
      ];

      await flow.start(steps);
    },
    [address, client, publicClient, flow, groupId],
  );

  return { execute, flow };
}

export function useActivateMarketGroup(groupId: string) {
  const client = useOddMakiClient();
  const { address } = useConnection();
  const publicClient = usePublicClient();

  const flow = useTransactionFlow({
    invalidateKeys: [
      queryKeys.marketGroups.all,
      queryKeys.marketGroups.detail(groupId),
      queryKeys.marketGroups.markets(groupId),
      queryKeys.unifiedFeed.all,
    ],
  });

  const execute = useCallback(async () => {
    if (!address || !publicClient) return;

    const steps: FlowStep[] = [
      {
        id: "activate-group",
        label: "Activate Market Group",
        execute: async () => {
          await waitForRPCSync();
          const hash = await client.market.activateMarketGroup({
            marketGroupId: BigInt(groupId),
          });

          await publicClient.waitForTransactionReceipt({ hash });
        },
      },
    ];

    await flow.start(steps);
  }, [address, client, publicClient, flow, groupId]);

  return { execute, flow };
}

export function useActivatePlaceholder(groupId: string) {
  const client = useOddMakiClient();
  const { address } = useConnection();
  const publicClient = usePublicClient();

  const flow = useTransactionFlow({
    invalidateKeys: [
      queryKeys.marketGroups.detail(groupId),
      queryKeys.marketGroups.markets(groupId),
    ],
  });

  const execute = useCallback(
    async (marketId: string, marketName: string, marketQuestion: string) => {
      if (!address || !publicClient) return;

      const steps: FlowStep[] = [
        {
          id: "activate-placeholder",
          label: `Activate: ${marketName}`,
          execute: async () => {
            await waitForRPCSync();
            const hash = await client.market.activatePlaceholder({
              marketGroupId: BigInt(groupId),
              marketId: BigInt(marketId),
              marketName,
              marketQuestion,
            });

            await publicClient.waitForTransactionReceipt({ hash });
          },
        },
      ];

      await flow.start(steps);
    },
    [address, client, publicClient, flow, groupId],
  );

  return { execute, flow };
}
