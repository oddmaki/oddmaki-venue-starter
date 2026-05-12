"use client";

import type { PriceMarketFormData } from "../types";
import type { FlowStep } from "@/lib/oddmaki/useTransactionFlow";

import { useCallback } from "react";
import { usePublicClient } from "wagmi";
import { parseEther } from "viem";
import { VenueFacetABI } from "@oddmaki-protocol/sdk";

import { PYTH_HERMES_BASE } from "../lib/pythFeeds";

import { useOddMakiClient } from "@/lib/oddmaki/hooks";
import {
  useTransactionFlow,
  waitForAllowance,
} from "@/lib/oddmaki/useTransactionFlow";
import { queryKeys } from "@/lib/oddmaki/queryKeys";
import {
  DIAMOND_ADDRESS,
  USDC_ADDRESS,
  USDC_DECIMALS,
} from "@/lib/oddmaki/constants";

const waitForRPCSync = (ms = 2000) => new Promise((r) => setTimeout(r, ms));

const TX_MINING_BUFFER_SECONDS = 30;

async function validatePythFeedId(feedId: string): Promise<void> {
  const res = await fetch(
    `${PYTH_HERMES_BASE}/v2/updates/price/latest?ids[]=${feedId}`,
  );

  if (!res.ok) {
    throw new Error(`Invalid Pyth Feed ID or Hermes API error (${res.status})`);
  }
  const data: { parsed?: unknown[] } = await res.json();

  if (!data.parsed || data.parsed.length === 0) {
    throw new Error(
      "Pyth Feed ID not found. Check the ID at pyth.network/developers/price-feed-ids",
    );
  }
}

export interface PriceMarketSubmission {
  closeTimeUnix: number;
  outcomes: [string, string];
  title: string;
  description: string;
}

export function usePriceMarketCreation(
  venueId: bigint,
  onSuccess?: () => void,
) {
  const client = useOddMakiClient();
  const publicClient = usePublicClient();

  const flow = useTransactionFlow({
    invalidateKeys: [
      queryKeys.markets.all,
      queryKeys.markets.list(venueId.toString()),
      queryKeys.priceMarket.all,
      queryKeys.unifiedFeed.list(venueId.toString()),
    ],
    onSuccess,
  });

  const createPriceMarket = useCallback(
    async (
      formData: PriceMarketFormData,
      submission: PriceMarketSubmission,
      signer: `0x${string}`,
    ) => {
      if (!publicClient) throw new Error("Public client not available");

      const venue = (await publicClient.readContract({
        address: DIAMOND_ADDRESS,
        abi: VenueFacetABI,
        functionName: "getVenue",
        args: [venueId],
      })) as { marketCreationFee?: bigint };

      const creationFee = BigInt(venue.marketCreationFee ?? 0);

      const steps: FlowStep[] = [];

      steps.push({
        id: "validate-feed",
        label: "Validate Pyth feed",
        execute: async () => {
          await validatePythFeedId(formData.pythFeedId);
        },
      });

      if (creationFee > BigInt(0)) {
        const feeUsd = (Number(creationFee) / 10 ** USDC_DECIMALS).toFixed(2);

        steps.push({
          id: "usdc-approval",
          label: `Approve $${feeUsd} USDC market creation fee`,
          shouldSkip: async () => {
            const allowance = (await client.token.getAllowance(
              USDC_ADDRESS,
              signer,
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
              signer,
              DIAMOND_ADDRESS,
              creationFee,
            );
          },
        });
      }

      steps.push({
        id: "create-price-market",
        label: "Create price market on-chain",
        execute: async () => {
          await waitForRPCSync();

          const closeTime =
            formData.closeMode === "preset"
              ? Math.floor(Date.now() / 1000) +
                formData.presetSeconds +
                TX_MINING_BUFFER_SECONDS
              : submission.closeTimeUnix;

          const strikePrice = formData.useStrikePrice
            ? BigInt(
                Math.round(
                  Number(formData.strikePrice) *
                    Math.pow(10, Math.abs(formData.priceExpo)),
                ),
              )
            : undefined;

          const hash = await client.priceMarket.createPyth({
            venueId,
            pythFeedId: formData.pythFeedId as `0x${string}`,
            strikePrice,
            closeTime: BigInt(closeTime),
            outcomes: submission.outcomes,
            tickSize: parseEther(formData.tickSize),
            collateralToken: USDC_ADDRESS,
            question: {
              title: submission.title,
              description: submission.description,
            },
            liveness: BigInt(0),
            tags: formData.tags,
            resolutionWindow: BigInt(formData.resolutionWindow),
          });

          await publicClient.waitForTransactionReceipt({ hash });
        },
      });

      await flow.start(steps);
    },
    [client, publicClient, flow, venueId],
  );

  return {
    createPriceMarket,
    ...flow,
  };
}
