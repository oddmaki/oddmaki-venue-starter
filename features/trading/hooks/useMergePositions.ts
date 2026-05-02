"use client";

import type { FlowStep } from "@/lib/oddmaki/useTransactionFlow";

import { useCallback } from "react";
import { useConnection, usePublicClient } from "wagmi";

import { useOddMakiClient } from "@/lib/oddmaki/hooks";
import { queryKeys } from "@/lib/oddmaki/queryKeys";
import {
  DIAMOND_ADDRESS,
  CTF_ADDRESS,
  USDC_DECIMALS,
} from "@/lib/oddmaki/constants";
import { useTransactionFlow } from "@/lib/oddmaki/useTransactionFlow";

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

interface MergePositionsParams {
  marketId: string;
  /** Amount of each outcome token to merge, as a decimal string (e.g. "10.5") */
  amount: string;
}

export function useMergePositions() {
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

  const startMergePositions = useCallback(
    async (params: MergePositionsParams) => {
      if (!address || !publicClient) return;

      const marketIdBig = BigInt(params.marketId);
      const amount = BigInt(
        Math.round(parseFloat(params.amount) * Math.pow(10, USDC_DECIMALS)),
      );

      const steps: FlowStep[] = [
        {
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
        },
        {
          id: "merge-positions",
          label: "Merge Positions",
          execute: async () => {
            const hash = await client.trade.mergePositions(marketIdBig, amount);

            await publicClient.waitForTransactionReceipt({ hash });
          },
        },
      ];

      await flow.start(steps);
    },
    [address, client, publicClient, flow],
  );

  return { startMergePositions, flow };
}
