"use client";

import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";

import { useOddMakiClient } from "@/lib/oddmaki/hooks";
import { queryKeys } from "@/lib/oddmaki/queryKeys";

/**
 * Check if the current user can trade on a specific market.
 * Uses the Diamond's canTradeOnMarket view (market-level AC with venue-level fallback).
 */
export function useCanTradeOnMarket(marketId: bigint | undefined) {
  const client = useOddMakiClient();
  const { address } = useAccount();

  return useQuery({
    queryKey: queryKeys.accessControl.canTrade(
      marketId?.toString() ?? "",
      address ?? "0x",
    ),
    queryFn: async () => {
      if (!address || marketId === undefined) return true;

      return client.accessControl.canTradeOnMarket({
        user: address,
        marketId,
      });
    },
    enabled: !!address && marketId !== undefined,
    staleTime: 30_000,
  });
}

/**
 * Check if the current user can create markets on a specific venue.
 * Uses the Diamond's canCreateMarket view (venue-level only).
 */
export function useCanCreateMarket(venueId: bigint | undefined) {
  const client = useOddMakiClient();
  const { address } = useAccount();

  return useQuery({
    queryKey: queryKeys.accessControl.canCreate(
      venueId?.toString() ?? "",
      address ?? "0x",
    ),
    queryFn: async () => {
      if (!address || venueId === undefined) return true;

      return client.venue.canCreateMarket(address, venueId);
    },
    enabled: !!address && venueId !== undefined,
    staleTime: 30_000,
  });
}
