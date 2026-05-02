"use client";

/**
 * ERC20 Approval Check Hook
 *
 * Checks allowance and approves a spender if needed.
 * Uses the OddMaki SDK token module.
 */

import type { Address } from "viem";

import { useQuery } from "@tanstack/react-query";
import { useConnection } from "wagmi";

import { useOddMakiClient } from "./hooks";
import { useTransaction } from "./useTransaction";
import { queryKeys } from "./queryKeys";
import { MAX_UINT256 } from "./constants";

interface UseApprovalCheckOptions {
  token: Address;
  spender: Address;
  /** If provided, only approve when allowance < requiredAmount. Otherwise checks for zero allowance. */
  requiredAmount?: bigint;
}

export function useApprovalCheck({
  token,
  spender,
  requiredAmount,
}: UseApprovalCheckOptions) {
  const client = useOddMakiClient();
  const { address } = useConnection();

  const {
    data: allowance,
    isLoading: isChecking,
    refetch,
  } = useQuery<bigint>({
    queryKey: queryKeys.approval.erc20(token, address!, spender),
    queryFn: () =>
      client.token.getAllowance(token, address!, spender) as Promise<bigint>,
    enabled: !!address,
  });

  const needsApproval =
    allowance != null &&
    (requiredAmount ? allowance < requiredAmount : allowance === BigInt(0));

  const { execute, isLoading: isApproving } = useTransaction({
    pendingMessage: "Approving token...",
    successMessage: "Token approved",
    errorMessage: "Approval failed",
    invalidateKeys: address
      ? [queryKeys.approval.erc20(token, address, spender)]
      : [],
  });

  const approve = async (amount?: bigint) => {
    if (!address) return;
    const approvalAmount = amount ?? MAX_UINT256;

    await execute(() => client.token.approve(token, spender, approvalAmount));
    refetch();
  };

  return {
    allowance,
    needsApproval,
    isChecking,
    isApproving,
    approve,
  };
}
