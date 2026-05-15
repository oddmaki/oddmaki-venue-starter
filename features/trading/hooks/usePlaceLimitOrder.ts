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

interface PlaceLimitOrderParams {
  marketId: string;
  outcomeIndex: 0 | 1;
  side: "BUY" | "SELL";
  price: string;
  quantity: string;
  expiry: string;
}

export function usePlaceLimitOrder() {
  const client = useOddMakiClient();
  const { address } = useAccount();
  const publicClient = usePublicClient();

  const flow = useTransactionFlow({
    invalidateKeys: [
      queryKeys.markets.all,
      queryKeys.positions.all,
      queryKeys.balance.all,
      queryKeys.orderbook.all,
      queryKeys.orders.all,
    ],
  });

  const startPlaceLimitOrder = useCallback(
    async (params: PlaceLimitOrderParams) => {
      if (!address || !publicClient) return;

      const marketIdBig = BigInt(params.marketId);
      const steps: FlowStep[] = [];

      if (params.side === "BUY") {
        // USDC approval for buy: price * quantity
        const cost = BigInt(
          Math.round(
            parseFloat(params.price) *
              parseFloat(params.quantity) *
              Math.pow(10, USDC_DECIMALS),
          ),
        );

        steps.push({
          id: "usdc-approval",
          label: `USDC Approval ($${(Number(cost) / Math.pow(10, USDC_DECIMALS)).toFixed(2)})`,
          shouldSkip: async () => {
            const allowance = (await client.token.getAllowance(
              USDC_ADDRESS,
              address,
              DIAMOND_ADDRESS,
            )) as bigint;

            return allowance >= cost;
          },
          execute: async () => {
            const hash = await client.token.approve(
              USDC_ADDRESS,
              DIAMOND_ADDRESS,
              cost,
            );

            await publicClient.waitForTransactionReceipt({ hash });
            await waitForAllowance(
              publicClient,
              USDC_ADDRESS,
              address,
              DIAMOND_ADDRESS,
              cost,
            );
          },
        });
      } else {
        // CTF approval for sell
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
      }

      // Place order step
      steps.push({
        id: "place-order",
        label: `Place ${params.side === "BUY" ? "Buy" : "Sell"} Order`,
        execute: async () => {
          const hash = await client.trade.placeOrderSimple({
            marketId: marketIdBig,
            outcomeId: BigInt(params.outcomeIndex),
            side: params.side === "BUY" ? 0 : 1,
            price: params.price,
            quantity: params.quantity,
            expiry: params.expiry,
          });

          await publicClient.waitForTransactionReceipt({ hash });
        },
      });

      await flow.start(steps);
    },
    [address, client, publicClient, flow],
  );

  return {
    startPlaceLimitOrder,
    flow,
  };
}
