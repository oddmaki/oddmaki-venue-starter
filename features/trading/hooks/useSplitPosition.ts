"use client";

import type { FlowStep } from "@/lib/oddmaki/useTransactionFlow";

import { useCallback } from "react";
import { useConnection, usePublicClient } from "wagmi";

import { useOddMakiClient } from "@/lib/oddmaki/hooks";
import { queryKeys } from "@/lib/oddmaki/queryKeys";
import {
  USDC_ADDRESS,
  DIAMOND_ADDRESS,
  USDC_DECIMALS,
} from "@/lib/oddmaki/constants";
import {
  useTransactionFlow,
  waitForAllowance,
} from "@/lib/oddmaki/useTransactionFlow";

interface SplitPositionParams {
  marketId: string;
  /** USDC amount as a decimal string (e.g. "10.5") */
  amount: string;
}

export function useSplitPosition() {
  const client = useOddMakiClient();
  const { address } = useConnection();
  const publicClient = usePublicClient();

  const flow = useTransactionFlow({
    invalidateKeys: [
      queryKeys.markets.all,
      queryKeys.positions.all,
      queryKeys.balance.all,
    ],
  });

  const startSplitPosition = useCallback(
    async (params: SplitPositionParams) => {
      if (!address || !publicClient) return;

      const marketIdBig = BigInt(params.marketId);
      const usdcAmount = BigInt(
        Math.round(parseFloat(params.amount) * Math.pow(10, USDC_DECIMALS)),
      );

      const steps: FlowStep[] = [
        {
          id: "usdc-approval",
          label: `USDC Approval ($${params.amount})`,
          shouldSkip: async () => {
            const allowance = (await client.token.getAllowance(
              USDC_ADDRESS,
              address,
              DIAMOND_ADDRESS,
            )) as bigint;

            return allowance >= usdcAmount;
          },
          execute: async () => {
            const hash = await client.token.approve(
              USDC_ADDRESS,
              DIAMOND_ADDRESS,
              usdcAmount,
            );

            await publicClient.waitForTransactionReceipt({ hash });
            await waitForAllowance(
              publicClient,
              USDC_ADDRESS,
              address,
              DIAMOND_ADDRESS,
              usdcAmount,
            );
          },
        },
        {
          id: "split-position",
          label: "Split Position",
          execute: async () => {
            const hash = await client.trade.splitPosition(
              marketIdBig,
              usdcAmount,
            );

            await publicClient.waitForTransactionReceipt({ hash });
          },
        },
      ];

      await flow.start(steps);
    },
    [address, client, publicClient, flow],
  );

  return { startSplitPosition, flow };
}
