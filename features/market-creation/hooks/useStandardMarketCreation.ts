"use client";

import type { StandardMarketFormData } from "../types";
import type { AccessControlType } from "@/features/access-control/hooks/useDeployAccessControl";
import type { FlowStep } from "@/lib/oddmaki/useTransactionFlow";

import { useCallback } from "react";
import { usePublicClient } from "wagmi";
import { decodeEventLog, parseEther, parseUnits } from "viem";
import { MarketsFacetABI, VenueFacetABI } from "@oddmaki-protocol/sdk";

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

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as const;

const waitForRPCSync = (ms = 2000) => new Promise((r) => setTimeout(r, ms));

interface MarketCreatedArgs {
  marketId: bigint;
}

function decodeMarketId(
  logs: { topics: readonly `0x${string}`[]; data: `0x${string}` }[],
): bigint | null {
  for (const log of logs) {
    try {
      const decoded = decodeEventLog({
        abi: MarketsFacetABI,
        eventName: "MarketCreated",
        topics: log.topics as [`0x${string}`, ...`0x${string}`[]],
        data: log.data,
      });
      const args = decoded.args as unknown as MarketCreatedArgs;

      if (args?.marketId !== undefined) return BigInt(args.marketId);
    } catch {
      // not the right event — keep scanning
    }
  }

  return null;
}

export function useStandardMarketCreation(
  venueId: bigint,
  onSuccess?: () => void,
) {
  const client = useOddMakiClient();
  const publicClient = usePublicClient();

  const flow = useTransactionFlow({
    invalidateKeys: [
      queryKeys.markets.all,
      queryKeys.markets.list(venueId.toString()),
      queryKeys.unifiedFeed.list(venueId.toString()),
    ],
    onSuccess,
  });

  const resolveAC = useCallback(
    async (
      type: AccessControlType,
      customAddress: string,
      nftContract: string,
      nftTokenId: string,
      tokenContract: string,
      tokenMinBalance: string,
    ): Promise<`0x${string}`> => {
      if (type === "public") return ZERO_ADDRESS;
      if (type === "custom") return customAddress as `0x${string}`;

      if (type === "whitelist") {
        return client.accessControl.deployWhitelist().then(async (hash) => {
          const receipt = await publicClient!.waitForTransactionReceipt({
            hash,
          });
          const log = receipt.logs.find(
            (l) =>
              l.topics[0] ===
              "0xf84d091c33e25edb2fa1abb290df9814b644f5f0c29e25546983ae2577276a41",
          );

          if (!log || !log.topics[2]) throw new Error("Deploy event not found");

          return ("0x" + log.topics[2].slice(26)) as `0x${string}`;
        });
      }

      if (type === "nft-erc721" || type === "nft-erc1155") {
        const hash = await client.accessControl.deployNFTGated({
          nftContract: nftContract as `0x${string}`,
          isERC1155: type === "nft-erc1155",
          tokenId: BigInt(nftTokenId || "0"),
        });
        const receipt = await publicClient!.waitForTransactionReceipt({ hash });
        const log = receipt.logs.find(
          (l) =>
            l.topics[0] ===
            "0xf84d091c33e25edb2fa1abb290df9814b644f5f0c29e25546983ae2577276a41",
        );

        if (!log || !log.topics[2]) throw new Error("Deploy event not found");

        return ("0x" + log.topics[2].slice(26)) as `0x${string}`;
      }

      if (type === "token") {
        const hash = await client.accessControl.deployTokenGated({
          token: tokenContract as `0x${string}`,
          minBalance: parseUnits(tokenMinBalance || "0", 18),
        });
        const receipt = await publicClient!.waitForTransactionReceipt({ hash });
        const log = receipt.logs.find(
          (l) =>
            l.topics[0] ===
            "0xf84d091c33e25edb2fa1abb290df9814b644f5f0c29e25546983ae2577276a41",
        );

        if (!log || !log.topics[2]) throw new Error("Deploy event not found");

        return ("0x" + log.topics[2].slice(26)) as `0x${string}`;
      }

      return ZERO_ADDRESS;
    },
    [client, publicClient],
  );

  const createMarket = useCallback(
    async (formData: StandardMarketFormData, signer: `0x${string}`) => {
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

      const needsACOverride = formData.tradingACType !== "public";
      const needsDeployAC =
        needsACOverride && formData.tradingACType !== "custom";

      let acAddress: `0x${string}` = ZERO_ADDRESS;
      let createdMarketId: bigint | undefined;

      if (needsACOverride && formData.tradingACType === "custom") {
        acAddress = (formData.tradingACCustomAddress ||
          ZERO_ADDRESS) as `0x${string}`;
      }

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

      if (needsDeployAC) {
        steps.push({
          id: "deploy-trading-ac",
          label: `Deploy ${formData.tradingACType} access control`,
          execute: async () => {
            acAddress = await resolveAC(
              formData.tradingACType,
              formData.tradingACCustomAddress,
              formData.tradingACNftContract,
              formData.tradingACNftTokenId,
              formData.tradingACTokenContract,
              formData.tradingACTokenMinBalance,
            );
          },
        });
      }

      steps.push({
        id: "create-market",
        label: "Create market on-chain",
        execute: async () => {
          await waitForRPCSync();
          const outcomes: [string, string] =
            formData.outcomeMode === "binary"
              ? ["Yes", "No"]
              : [
                  (formData.outcomes[0] ?? "").trim(),
                  (formData.outcomes[1] ?? "").trim(),
                ];

          const hash = await client.market.createMarket({
            venueId,
            question: {
              title: formData.title,
              description: formData.description,
            },
            outcomes,
            tickSize: parseEther(formData.tickSize),
            collateralToken: USDC_ADDRESS,
            additionalReward,
            liveness: BigInt(formData.liveness),
            tags: formData.tags,
          });
          const receipt = await publicClient.waitForTransactionReceipt({
            hash,
          });

          if (needsACOverride) {
            const marketId = decodeMarketId(receipt.logs);

            if (marketId === null) {
              throw new Error(
                "MarketCreated event not found in transaction logs",
              );
            }
            createdMarketId = marketId;
          }
        },
      });

      if (needsACOverride) {
        steps.push({
          id: "set-market-trading-ac",
          label: "Set market trading access control",
          execute: async () => {
            if (!createdMarketId) throw new Error("Market ID not available");
            await waitForRPCSync();
            const hash = await client.accessControl.setMarketTradingAC({
              marketId: createdMarketId,
              acContract: acAddress,
            });

            await publicClient.waitForTransactionReceipt({ hash });
          },
        });
      }

      await flow.start(steps);
    },
    [client, publicClient, flow, resolveAC, venueId],
  );

  return {
    createMarket,
    ...flow,
  };
}
