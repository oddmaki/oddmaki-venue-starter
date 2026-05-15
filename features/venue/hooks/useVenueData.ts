"use client";

import { useQuery } from "@tanstack/react-query";
import { useAccount, usePublicClient } from "wagmi";
import { VenueFacetABI } from "@oddmaki-protocol/sdk";

import { getVenueId } from "@/config/venue.config";
import { queryKeys } from "@/lib/oddmaki/queryKeys";
import { DIAMOND_ADDRESS } from "@/lib/oddmaki/constants";

export interface VenueData {
  venueId: bigint;
  operator: `0x${string}`;
  name: string;
  metadata: string;
  tradingAccessControl: `0x${string}`;
  creationAccessControl: `0x${string}`;
  feeRecipient: `0x${string}`;
  venueFeeBps: bigint;
  creatorFeeBps: bigint;
  defaultTickSize: bigint;
  marketCreationFee: bigint;
  umaRewardAmount: bigint;
  umaMinBond: bigint;
  active: boolean;
}

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export function useVenueData() {
  const venueId = getVenueId();
  const { address } = useAccount();
  const publicClient = usePublicClient();

  const { data: venue, isLoading } = useQuery<VenueData>({
    queryKey: queryKeys.venue.detail(venueId?.toString() ?? ""),
    queryFn: async () => {
      const result = await publicClient!.readContract({
        address: DIAMOND_ADDRESS,
        abi: VenueFacetABI,
        functionName: "getVenue",
        args: [venueId!],
      });

      return result as unknown as VenueData;
    },
    enabled: !!publicClient && venueId !== undefined,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const isOperator =
    !!venue &&
    !!address &&
    venue.operator.toLowerCase() === address.toLowerCase();

  const isPublicTrading =
    !!venue && venue.tradingAccessControl === ZERO_ADDRESS;
  const isPublicCreation =
    !!venue && venue.creationAccessControl === ZERO_ADDRESS;

  return {
    venue,
    isOperator,
    isPublicTrading,
    isPublicCreation,
    isLoading,
  };
}
