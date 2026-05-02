"use client";

import type { Address } from "viem";
import type { FlowStep } from "@/lib/oddmaki/useTransactionFlow";

import { useCallback } from "react";
import { useConnection, usePublicClient } from "wagmi";
import { parseEther } from "viem";
import { VenueFacetABI } from "@oddmaki-protocol/sdk";

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

/** Wait for RPC nodes to propagate state after a confirmed transaction. */
const waitForRPCSync = (ms = 2000) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const PYTH_HERMES_BASE = "https://hermes.pyth.network";

/** Validate a Pyth feed ID by fetching its latest price from Hermes. */
async function validatePythFeedId(feedId: string): Promise<void> {
  const res = await fetch(
    `${PYTH_HERMES_BASE}/v2/updates/price/latest?ids[]=${feedId}`,
  );

  if (!res.ok) {
    throw new Error(`Invalid Pyth Feed ID or Hermes API error (${res.status})`);
  }

  const data: any = await res.json();

  if (!data.parsed || data.parsed.length === 0) {
    throw new Error(
      "Pyth Feed ID not found. Check the ID at pyth.network/developers/price-feed-ids",
    );
  }
}

interface CreatePriceMarketParams {
  venueId: bigint;
  pythFeedId: `0x${string}`;
  closeTime: number;
  title: string;
  description: string;
  outcomes?: string[];
  strikePrice?: bigint;
  tags?: string[];
  tickSize?: string;
}

export function useCreatePriceMarket() {
  const client = useOddMakiClient();
  const { address } = useConnection();
  const publicClient = usePublicClient();

  const flow = useTransactionFlow({
    invalidateKeys: [
      queryKeys.markets.all,
      queryKeys.priceMarket.all,
      ...(address ? [queryKeys.balance.usdc(address)] : []),
    ],
  });

  const startCreatePriceMarket = useCallback(
    async (params: CreatePriceMarketParams) => {
      if (!address || !publicClient) return;

      // Read the market creation fee from the venue config on-chain
      const venue = (await publicClient.readContract({
        address: DIAMOND_ADDRESS,
        abi: VenueFacetABI,
        functionName: "getVenue",
        args: [params.venueId],
      })) as any;
      const creationFee = BigInt(venue.marketCreationFee);

      const steps: FlowStep[] = [
        {
          id: "validate-feed",
          label: "Validate Pyth Feed",
          execute: async () => {
            await validatePythFeedId(params.pythFeedId);
          },
        },
        {
          id: "usdc-approval",
          label: `USDC Approval ($${(Number(creationFee) / Math.pow(10, USDC_DECIMALS)).toFixed(2)})`,
          shouldSkip: async () => {
            const allowance = (await client.token.getAllowance(
              USDC_ADDRESS,
              address,
              DIAMOND_ADDRESS,
            )) as bigint;

            return allowance >= creationFee;
          },
          execute: async () => {
            const hash = await client.token.approve(
              USDC_ADDRESS,
              DIAMOND_ADDRESS,
              creationFee,
            );

            await publicClient.waitForTransactionReceipt({ hash });
            await waitForAllowance(
              publicClient,
              USDC_ADDRESS,
              address,
              DIAMOND_ADDRESS,
              creationFee,
            );
          },
        },
        {
          id: "create-price-market",
          label: "Create Price Market",
          execute: async () => {
            await waitForRPCSync();
            const hash = await client.priceMarket.createPyth({
              venueId: params.venueId,
              pythFeedId: params.pythFeedId,
              strikePrice: params.strikePrice,
              closeTime: BigInt(params.closeTime),
              outcomes: params.outcomes ?? ["Up", "Down"],
              tickSize: parseEther(params.tickSize || "0.01"),
              collateralToken: USDC_ADDRESS as Address,
              question: {
                title: params.title,
                description: params.description,
              },
              liveness: BigInt(0),
              tags: params.tags,
            });

            await publicClient.waitForTransactionReceipt({ hash });
          },
        },
      ];

      await flow.start(steps);
    },
    [address, client, publicClient, flow],
  );

  return { startCreatePriceMarket, flow };
}
