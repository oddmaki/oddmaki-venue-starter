"use client";

import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";

import { useOddMakiClient } from "@/lib/oddmaki/hooks";
import { queryKeys } from "@/lib/oddmaki/queryKeys";
import { USDC_ADDRESS, USDC_DECIMALS } from "@/lib/oddmaki/constants";

/**
 * Hook to poll the user's USDC balance.
 * Returns both raw (bigint) and formatted (string) values.
 */
export function useTokenBalance() {
  const client = useOddMakiClient();
  const { address } = useAccount();

  const {
    data: balance,
    isLoading,
    refetch,
  } = useQuery<bigint>({
    queryKey: queryKeys.balance.usdc(address!),
    queryFn: () =>
      client.token.getBalance(USDC_ADDRESS, address!) as Promise<bigint>,
    enabled: !!address,
    refetchInterval: 15_000, // Poll every 15s
  });

  const formatted =
    balance != null
      ? (Number(balance) / 10 ** USDC_DECIMALS).toFixed(2)
      : "0.00";

  return {
    balance: balance ?? BigInt(0),
    formatted,
    isLoading,
    refetch,
  };
}
