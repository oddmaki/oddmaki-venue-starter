"use client";

import { useQuery } from "@tanstack/react-query";
import { usePublicClient } from "wagmi";
import { WhitelistAccessControlABI } from "@oddmaki-protocol/sdk";

import { queryKeys } from "@/lib/oddmaki/queryKeys";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

/**
 * Read the owner() of a WhitelistAccessControl contract.
 * If the call reverts (not a whitelist contract), the query errors.
 */
export function useWhitelistOwner(acContract: `0x${string}` | undefined) {
  const publicClient = usePublicClient();

  return useQuery<`0x${string}`>({
    queryKey: queryKeys.accessControl.whitelistOwner(acContract ?? "0x"),
    queryFn: async () => {
      return publicClient!.readContract({
        address: acContract!,
        abi: WhitelistAccessControlABI,
        functionName: "owner",
      }) as Promise<`0x${string}`>;
    },
    enabled: !!publicClient && !!acContract && acContract !== ZERO_ADDRESS,
    staleTime: 60_000,
    retry: false,
  });
}
