"use client";

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
import { getVenueId } from "@/config/venue.config";

/** Wait for RPC nodes to propagate state after a confirmed transaction. */
const waitForRPCSync = (ms = 2000) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// keccak256("MarketGroupCreated(uint256,uint256,address,string,uint256,bytes32[])")
const MARKET_GROUP_CREATED_TOPIC =
  "0xbef3dbd08d88fb28eed9867db23e817b75def4129bdddc48afda5704907a39b7";

interface MarketOutcome {
  name: string; // Short label: "Warriors", "$78k-$80k"
  question: string; // Resolution question for this market
}

interface CreateMarketGroupParams {
  title: string;
  description: string;
  tags?: string[];
  markets: MarketOutcome[];
  placeholderCount?: number;
  activateImmediately?: boolean;
  tickSize?: string;
}

export function useCreateMarketGroup() {
  const client = useOddMakiClient();
  const { address } = useConnection();
  const publicClient = usePublicClient();

  const flow = useTransactionFlow({
    invalidateKeys: [
      queryKeys.marketGroups.all,
      queryKeys.unifiedFeed.all,
      queryKeys.markets.all,
    ],
  });

  const startCreateMarketGroup = useCallback(
    async (params: CreateMarketGroupParams) => {
      const venueId = getVenueId();

      if (!address || venueId === undefined || !publicClient) return;

      // Read the market creation fee from the venue config on-chain

      const venue = (await publicClient.readContract({
        address: DIAMOND_ADDRESS,
        abi: VenueFacetABI,
        functionName: "getVenue",
        args: [venueId],
      })) as any;
      const creationFee = BigInt(venue.marketCreationFee);
      const umaReward = BigInt(venue.umaRewardAmount ?? 0);
      const totalApproval = creationFee + umaReward;

      let createdGroupId: bigint | undefined;
      const activateImmediately = params.activateImmediately !== false;

      const steps: FlowStep[] = [
        // Step 1: USDC Approval (creation fee + UMA reward)
        {
          id: "usdc-approval",
          label: `USDC Approval ($${(Number(totalApproval) / Math.pow(10, USDC_DECIMALS)).toFixed(2)})`,
          shouldSkip: async () => {
            const allowance = (await client.token.getAllowance(
              USDC_ADDRESS,
              address,
              DIAMOND_ADDRESS,
            )) as bigint;

            return allowance >= totalApproval;
          },
          execute: async () => {
            const hash = await client.token.approve(
              USDC_ADDRESS,
              DIAMOND_ADDRESS,
              totalApproval,
            );

            await publicClient.waitForTransactionReceipt({ hash });
            await waitForAllowance(
              publicClient,
              USDC_ADDRESS,
              address,
              DIAMOND_ADDRESS,
              totalApproval,
            );
          },
        },
        // Step 2: Create Market Group
        {
          id: "create-group",
          label: "Create Market Group",
          execute: async () => {
            await waitForRPCSync();
            const hash = await client.market.createMarketGroup({
              venueId,
              question: params.title,
              description: params.description,
              collateralToken: USDC_ADDRESS,
              tickSize: parseEther(params.tickSize || "0.01"),
              additionalReward: BigInt(0),
              tags: params.tags,
            });
            const receipt = await publicClient.waitForTransactionReceipt({
              hash,
            });

            // Extract groupId from MarketGroupCreated event
            const log = receipt.logs.find(
              (l) => l.topics[0] === MARKET_GROUP_CREATED_TOPIC,
            );

            if (!log || !log.topics[1])
              throw new Error("MarketGroupCreated event not found in receipt");
            createdGroupId = BigInt(log.topics[1]);
          },
        },
      ];

      // Steps 3..N: Add each market
      params.markets.forEach((market, i) => {
        steps.push({
          id: `add-market-${i}`,
          label: `Add Market: ${market.name}`,
          execute: async () => {
            if (!createdGroupId) throw new Error("Group ID not available");
            await waitForRPCSync();
            const hash = await client.market.addMarketToGroup({
              marketGroupId: createdGroupId,
              marketName: market.name,
              marketQuestion: market.question,
            });

            await publicClient.waitForTransactionReceipt({ hash });
          },
        });
      });

      // Step: Add placeholders (optional)
      if (params.placeholderCount && params.placeholderCount > 0) {
        steps.push({
          id: "add-placeholders",
          label: `Add ${params.placeholderCount} Placeholder${params.placeholderCount > 1 ? "s" : ""}`,
          execute: async () => {
            if (!createdGroupId) throw new Error("Group ID not available");
            await waitForRPCSync();
            const hash = await client.market.addPlaceholderMarkets({
              marketGroupId: createdGroupId,
              count: BigInt(params.placeholderCount!),
            });

            await publicClient.waitForTransactionReceipt({ hash });
          },
        });
      }

      // Step: Activate Group (optional)
      if (activateImmediately) {
        steps.push({
          id: "activate-group",
          label: "Activate Market Group",
          execute: async () => {
            if (!createdGroupId) throw new Error("Group ID not available");
            await waitForRPCSync();
            const hash = await client.market.activateMarketGroup({
              marketGroupId: createdGroupId,
            });

            await publicClient.waitForTransactionReceipt({ hash });
          },
        });
      }

      await flow.start(steps);
    },
    [address, client, publicClient, flow],
  );

  return { startCreateMarketGroup, flow };
}
