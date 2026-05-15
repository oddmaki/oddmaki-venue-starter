"use client";

/**
 * CTF (Conditional Tokens) Approval Hook
 *
 * Checks and sets ERC-1155 `setApprovalForAll` for the Diamond proxy
 * on the ConditionalTokens contract. Required for selling outcome tokens.
 */

import type { Address } from "viem";

import { useQuery } from "@tanstack/react-query";
import { useAccount, usePublicClient } from "wagmi";

import { useTransaction } from "./useTransaction";
import { queryKeys } from "./queryKeys";
import { CTF_ADDRESS, DIAMOND_ADDRESS } from "./constants";
import { useOddMakiClient } from "./hooks";

// ERC-1155 ABI subset for approval (not in SDK's ConditionalTokens ABI)
const ERC1155_APPROVAL_ABI = [
  {
    type: "function",
    name: "isApprovedForAll",
    inputs: [
      { name: "account", type: "address" },
      { name: "operator", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "setApprovalForAll",
    inputs: [
      { name: "operator", type: "address" },
      { name: "approved", type: "bool" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

interface UseCTFApprovalOptions {
  /** Operator to approve. Defaults to DIAMOND_ADDRESS. */
  operator?: Address;
}

export function useCTFApproval({
  operator = DIAMOND_ADDRESS,
}: UseCTFApprovalOptions = {}) {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const client = useOddMakiClient();

  const {
    data: isApproved,
    isLoading: isChecking,
    refetch,
  } = useQuery({
    queryKey: queryKeys.approval.ctf(address!, operator),
    queryFn: () =>
      publicClient!.readContract({
        address: CTF_ADDRESS,
        abi: ERC1155_APPROVAL_ABI,
        functionName: "isApprovedForAll",
        args: [address!, operator],
      }),
    enabled: !!address && !!publicClient,
  });

  const needsApproval = isApproved === false;

  const { execute, isLoading: isApproving } = useTransaction({
    pendingMessage: "Approving outcome tokens...",
    successMessage: "Outcome tokens approved",
    errorMessage: "CTF approval failed",
    invalidateKeys: address ? [queryKeys.approval.ctf(address, operator)] : [],
  });

  const approve = async () => {
    if (!address || !client.config.walletClient) return;

    await execute(async () => {
      const wallet = client.config.walletClient!;
      const [account] = await wallet.getAddresses();

      const { request } = await publicClient!.simulateContract({
        address: CTF_ADDRESS,
        abi: ERC1155_APPROVAL_ABI,
        functionName: "setApprovalForAll",
        args: [operator, true],
        account,
      });

      return wallet.writeContract(request as any);
    });

    refetch();
  };

  return {
    isApproved: isApproved ?? false,
    needsApproval,
    isChecking,
    isApproving,
    approve,
  };
}
