"use client";

import type { GroupMarketFormData } from "../types";
import type { FlowStep } from "@/lib/oddmaki/useTransactionFlow";

import { useCallback } from "react";
import { usePublicClient } from "wagmi";
import { decodeEventLog, parseEther, parseUnits } from "viem";
import { MarketGroupFacetABI, VenueFacetABI } from "@oddmaki-protocol/sdk";

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

interface MarketGroupCreatedArgs {
  groupId: bigint;
}

function decodeGroupId(
  logs: { topics: readonly `0x${string}`[]; data: `0x${string}` }[],
): bigint | null {
  for (const log of logs) {
    try {
      const decoded = decodeEventLog({
        abi: MarketGroupFacetABI,
        eventName: "MarketGroupCreated",
        topics: log.topics as [`0x${string}`, ...`0x${string}`[]],
        data: log.data,
      });
      const args = decoded.args as unknown as MarketGroupCreatedArgs;

      if (args?.groupId !== undefined) return BigInt(args.groupId);
    } catch {
      // not the right event — keep scanning
    }
  }

  return null;
}

export function useGroupMarketCreation(
  venueId: bigint,
  onSuccess?: () => void,
) {
  const client = useOddMakiClient();
  const publicClient = usePublicClient();

  const flow = useTransactionFlow({
    invalidateKeys: [
      queryKeys.markets.all,
      queryKeys.markets.list(venueId.toString()),
      queryKeys.marketGroups.all,
      queryKeys.marketGroups.list(venueId.toString()),
      queryKeys.unifiedFeed.list(venueId.toString()),
    ],
    onSuccess,
  });

  const createGroup = useCallback(
    async (formData: GroupMarketFormData, signer: `0x${string}`) => {
      if (!publicClient) throw new Error("Public client not available");

      const venue: any = await publicClient.readContract({
        address: DIAMOND_ADDRESS,
        abi: VenueFacetABI,
        functionName: "getVenue",
        args: [venueId],
      });

      const creationFee = BigInt(venue.marketCreationFee ?? 0);
      const baseUmaReward = BigInt(venue.umaRewardAmount ?? 0);
      const additionalReward = parseUnits(
        formData.additionalReward.toString(),
        USDC_DECIMALS,
      );
      const totalApproval = creationFee + baseUmaReward + additionalReward;

      const validOutcomes = formData.outcomes.filter(
        (o) => o.name.trim() && o.question.trim(),
      );

      let createdGroupId: bigint | undefined;
      const steps: FlowStep[] = [];

      if (totalApproval > BigInt(0)) {
        const totalUsd = (Number(totalApproval) / 10 ** USDC_DECIMALS).toFixed(
          2,
        );
        const feeUsd = (Number(creationFee) / 10 ** USDC_DECIMALS).toFixed(2);
        const rewardUsd = (
          Number(baseUmaReward + additionalReward) /
          10 ** USDC_DECIMALS
        ).toFixed(2);

        steps.push({
          id: "usdc-approval",
          label: `Approve $${totalUsd} USDC (fee $${feeUsd} + UMA reward $${rewardUsd})`,
          shouldSkip: async () => {
            const allowance = (await client.token.getAllowance(
              USDC_ADDRESS,
              signer,
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
              signer,
              DIAMOND_ADDRESS,
              totalApproval,
            );
          },
        });
      }

      steps.push({
        id: "create-group",
        label: "Create market group on-chain",
        execute: async () => {
          await waitForRPCSync();
          const hash = await client.market.createMarketGroup({
            venueId,
            question: formData.title,
            description: formData.description,
            collateralToken: USDC_ADDRESS,
            tickSize: parseEther(formData.tickSize),
            additionalReward,
            liveness: BigInt(formData.liveness),
            tags: formData.tags,
          });
          const receipt = await publicClient.waitForTransactionReceipt({
            hash,
          });
          const groupId = decodeGroupId(receipt.logs);

          if (groupId === null) {
            throw new Error(
              "MarketGroupCreated event not found in transaction logs",
            );
          }
          createdGroupId = groupId;
        },
      });

      validOutcomes.forEach((outcome, i) => {
        steps.push({
          id: `add-market-${i}`,
          label: `Add outcome: ${outcome.name.slice(0, 32)}`,
          execute: async () => {
            if (!createdGroupId) throw new Error("Group ID not available");
            await waitForRPCSync();
            const hash = await client.market.addMarketToGroup({
              marketGroupId: createdGroupId,
              marketName: outcome.name.trim(),
              marketQuestion: outcome.question.trim(),
            });

            await publicClient.waitForTransactionReceipt({ hash });
          },
        });
      });

      if (formData.placeholderCount > 0) {
        steps.push({
          id: "add-placeholders",
          label: `Add ${formData.placeholderCount} placeholder${formData.placeholderCount > 1 ? "s" : ""}`,
          execute: async () => {
            if (!createdGroupId) throw new Error("Group ID not available");
            await waitForRPCSync();
            const hash = await client.market.addPlaceholderMarkets({
              marketGroupId: createdGroupId,
              count: BigInt(formData.placeholderCount),
            });

            await publicClient.waitForTransactionReceipt({ hash });
          },
        });
      }

      if (formData.activateImmediately) {
        steps.push({
          id: "activate-group",
          label: "Activate market group",
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
    [client, publicClient, flow, venueId],
  );

  return {
    createGroup,
    ...flow,
  };
}
