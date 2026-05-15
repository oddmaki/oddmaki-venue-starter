"use client";

import type { FlowStep } from "@/lib/oddmaki/useTransactionFlow";

import { useCallback } from "react";
import { useAccount, usePublicClient } from "wagmi";

import { useOddMakiClient } from "@/lib/oddmaki/hooks";
import { queryKeys } from "@/lib/oddmaki/queryKeys";
import {
  USDC_ADDRESS,
  DIAMOND_ADDRESS,
  CTF_ADDRESS,
  USDC_DECIMALS,
} from "@/lib/oddmaki/constants";
import {
  useTransactionFlow,
  waitForAllowance,
} from "@/lib/oddmaki/useTransactionFlow";

const ERC1155_APPROVAL_ABI = [
  {
    type: "function" as const,
    name: "isApprovedForAll" as const,
    inputs: [
      { name: "account", type: "address" },
      { name: "operator", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view" as const,
  },
  {
    type: "function" as const,
    name: "setApprovalForAll" as const,
    inputs: [
      { name: "operator", type: "address" },
      { name: "approved", type: "bool" },
    ],
    outputs: [],
    stateMutability: "nonpayable" as const,
  },
] as const;

interface PlaceMarketOrderParams {
  marketId: string;
  outcomeIndex: 0 | 1;
  side: "BUY" | "SELL";
  amount: string;
  maxPrice: string;
  orderType: "FOK" | "FAK";
}

export function usePlaceMarketOrder() {
  const client = useOddMakiClient();
  const { address } = useAccount();
  const publicClient = usePublicClient();

  const flow = useTransactionFlow({
    invalidateKeys: [
      queryKeys.markets.all,
      queryKeys.positions.all,
      queryKeys.balance.all,
      queryKeys.trades.all,
      queryKeys.orderbook.all,
    ],
  });

  const startPlaceMarketOrder = useCallback(
    async (params: PlaceMarketOrderParams) => {
      if (!address || !publicClient) return;

      const steps: FlowStep[] = [];

      if (params.side === "BUY") {
        const usdcAmount = BigInt(
          Math.round(parseFloat(params.amount) * Math.pow(10, USDC_DECIMALS)),
        );

        steps.push({
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
        });

        steps.push({
          id: "place-market-order",
          label: "Place Market Order",
          execute: async () => {
            const hash = await client.trade.placeMarketOrderSimple({
              marketId: BigInt(params.marketId),
              outcomeId: BigInt(params.outcomeIndex),
              amount: params.amount,
              maxPrice: params.maxPrice,
              orderType: params.orderType,
            });

            await publicClient.waitForTransactionReceipt({ hash });
          },
        });
      } else {
        // SELL: CTF (ERC-1155) approval + market sell
        steps.push({
          id: "ctf-approval",
          label: "Token Approval",
          shouldSkip: async () => {
            const approved = await publicClient.readContract({
              address: CTF_ADDRESS,
              abi: ERC1155_APPROVAL_ABI,
              functionName: "isApprovedForAll",
              args: [address, DIAMOND_ADDRESS],
            });

            return approved;
          },
          execute: async () => {
            const wallet = client.config.walletClient!;
            const [account] = await wallet.getAddresses();
            const { request } = await publicClient.simulateContract({
              address: CTF_ADDRESS,
              abi: ERC1155_APPROVAL_ABI,
              functionName: "setApprovalForAll",
              args: [DIAMOND_ADDRESS, true],
              account,
            });

            const hash = await wallet.writeContract(request as any);

            await publicClient.waitForTransactionReceipt({ hash });
          },
        });

        steps.push({
          id: "place-market-sell",
          label: "Place Market Sell",
          execute: async () => {
            const hash = await client.trade.placeMarketSellSimple({
              marketId: BigInt(params.marketId),
              outcomeId: BigInt(params.outcomeIndex),
              amount: params.amount,
              minPrice: params.maxPrice,
              orderType: params.orderType,
            });

            await publicClient.waitForTransactionReceipt({ hash });
          },
        });
      }

      await flow.start(steps);
    },
    [address, client, publicClient, flow],
  );

  return {
    startPlaceMarketOrder,
    flow,
  };
}
