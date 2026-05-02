"use client";

import type { MarketMetadata } from "@oddmaki-protocol/sdk";
import type { FlowStep } from "@/lib/oddmaki/useTransactionFlow";
import type { AccessControlType } from "@/features/access-control";

import { useCallback } from "react";
import { useConnection, usePublicClient } from "wagmi";
import { parseEther, parseUnits } from "viem";
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
import { useDeployAccessControl } from "@/features/access-control";
import { uploadImageToIPFS, uploadToIPFS } from "@/lib/ipfs";

const ZERO_ADDRESS =
  "0x0000000000000000000000000000000000000000" as `0x${string}`;

/** Wait for RPC nodes to propagate state after a confirmed transaction. */
const waitForRPCSync = (ms = 2000) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// keccak256("MarketCreated(uint256,uint256,address,bytes32,address,uint256,string,string[],uint256,bytes32[])")
const MARKET_CREATED_TOPIC =
  "0xdd895a7ed0ebaa00381dbd1d1264310105210e93f5b57edb84d38c5401c353de";

interface CreateMarketParams {
  title: string;
  description: string;
  tags?: string[];
  outcomes?: string[];
  tickSize?: string;
  liveness?: number;
  // Optional image for market metadata
  imageFile?: File;
  // Market-level trading AC override
  tradingACType?: AccessControlType;
  tradingCustomAddress?: string;
  tradingNftContract?: string;
  tradingNftTokenId?: string;
  tradingTokenContract?: string;
  tradingTokenMinBalance?: string;
}

/**
 * Hook to create a new market with per-transaction approval flow.
 * Optionally sets a market-level trading AC override after creation.
 */
export function useCreateMarket() {
  const client = useOddMakiClient();
  const { address } = useConnection();
  const publicClient = usePublicClient();
  const { deployWhitelist, deployNFTGated, deployTokenGated } =
    useDeployAccessControl();

  const flow = useTransactionFlow({
    invalidateKeys: [
      queryKeys.markets.all,
      ...(address ? [queryKeys.balance.usdc(address)] : []),
    ],
  });

  const startCreateMarket = useCallback(
    async (params: CreateMarketParams) => {
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

      const tickSizeWei = parseEther(params.tickSize || "0.01");

      // AC override logic
      const needsACOverride =
        !!params.tradingACType && params.tradingACType !== "public";
      const needsDeployAC =
        needsACOverride && params.tradingACType !== "custom";
      const hasImage = !!params.imageFile;
      const needsMarketId = needsACOverride || hasImage;

      let acAddress = ZERO_ADDRESS;
      let createdMarketId: bigint | undefined;

      // For custom type, resolve address immediately (no deploy needed)
      if (needsACOverride && params.tradingACType === "custom") {
        acAddress = (params.tradingCustomAddress ||
          ZERO_ADDRESS) as `0x${string}`;
      }

      // Helper to deploy an AC contract by type
      const resolveACAddress = async (): Promise<`0x${string}`> => {
        switch (params.tradingACType) {
          case "whitelist":
            return deployWhitelist();
          case "nft-erc721":
            return deployNFTGated({
              nftContract: (params.tradingNftContract || "") as `0x${string}`,
              isERC1155: false,
              tokenId: BigInt(0),
            });
          case "nft-erc1155":
            return deployNFTGated({
              nftContract: (params.tradingNftContract || "") as `0x${string}`,
              isERC1155: true,
              tokenId: BigInt(params.tradingNftTokenId || "0"),
            });
          case "token":
            return deployTokenGated({
              token: (params.tradingTokenContract || "") as `0x${string}`,
              minBalance: parseUnits(params.tradingTokenMinBalance || "0", 18),
            });
          default:
            return ZERO_ADDRESS;
        }
      };

      const steps: FlowStep[] = [
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
      ];

      // Step: Deploy Trading AC (if needed)
      if (needsDeployAC) {
        steps.push({
          id: "deploy-trading-ac",
          label: `Deploy Trading AC (${params.tradingACType})`,
          execute: async () => {
            acAddress = await resolveACAddress();
          },
        });
      }

      // Step: Create Market
      steps.push({
        id: "create-market",
        label: "Create Market",
        execute: async () => {
          // Wait for RPC nodes to propagate the approval state
          await waitForRPCSync();
          const hash = await client.market.createMarket({
            venueId,
            question: {
              title: params.title,
              description: params.description,
            },
            outcomes: params.outcomes || ["Yes", "No"],
            tickSize: tickSizeWei,
            collateralToken: USDC_ADDRESS,
            additionalReward: BigInt(0),
            liveness: BigInt(params.liveness ?? 0),
            tags: params.tags,
          });
          const receipt = await publicClient.waitForTransactionReceipt({
            hash,
          });

          // Extract marketId from receipt if we need it for AC override or metadata
          if (needsMarketId) {
            const log = receipt.logs.find(
              (l) => l.topics[0] === MARKET_CREATED_TOPIC,
            );

            if (!log || !log.topics[1])
              throw new Error("MarketCreated event not found in receipt");
            createdMarketId = BigInt(log.topics[1]);
          }
        },
      });

      // Step: Set Market Trading AC (if overriding)
      if (needsACOverride) {
        steps.push({
          id: "set-market-trading-ac",
          label: "Set Market Trading AC",
          execute: async () => {
            if (!createdMarketId) throw new Error("Market ID not available");
            // Wait for RPC nodes to propagate the new market state
            await waitForRPCSync();
            const hash = await client.accessControl.setMarketTradingAC({
              marketId: createdMarketId,
              acContract: acAddress,
            });

            await publicClient.waitForTransactionReceipt({ hash });
          },
        });
      }

      // Step: Upload image & set market metadata (if image provided)
      if (hasImage) {
        steps.push({
          id: "upload-metadata",
          label: "Upload Market Metadata",
          execute: async () => {
            if (!createdMarketId) throw new Error("Market ID not available");
            await waitForRPCSync();

            // Upload image to IPFS
            const imageUri = await uploadImageToIPFS(params.imageFile!);

            // Build and upload metadata JSON
            const metadata: MarketMetadata = {
              version: 1,
              image_url: imageUri,
            };
            const metadataUri = await uploadToIPFS(metadata);

            // Set on-chain metadata pointer
            const hash = await client.market.updateMarketMetadata({
              marketId: createdMarketId,
              metadataURI: metadataUri,
            });

            await publicClient.waitForTransactionReceipt({ hash });
          },
        });
      }

      await flow.start(steps);
    },
    [
      address,
      client,
      publicClient,
      flow,
      deployWhitelist,
      deployNFTGated,
      deployTokenGated,
    ],
  );

  return {
    startCreateMarket,
    flow,
  };
}
