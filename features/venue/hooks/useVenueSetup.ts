"use client";

import { useState, useCallback } from "react";
import { useConnection, usePublicClient } from "wagmi";
import { parseUnits, parseEther } from "viem";
import { VenueFacetABI } from "@oddmaki-protocol/sdk";

import { useOddMakiClient } from "@/lib/oddmaki/hooks";
import { useTransaction } from "@/lib/oddmaki/useTransaction";
import { queryKeys } from "@/lib/oddmaki/queryKeys";
import { DIAMOND_ADDRESS } from "@/lib/oddmaki/constants";
import { getVenueId } from "@/config/venue.config";

/**
 * Hook for venue setup — provides venueId from env var and
 * a mutation to create a new venue on-chain.
 */
export function useVenueSetup() {
  const client = useOddMakiClient();
  const { address } = useConnection();
  const publicClient = usePublicClient();

  const venueId = getVenueId();

  const [isSettingUp, setIsSettingUp] = useState(false);

  const {
    execute,
    isLoading: isCreating,
    error: createError,
  } = useTransaction({
    pendingMessage: "Creating venue...",
    successMessage: "Venue created!",
    errorMessage: "Failed to create venue",
    invalidateKeys: [queryKeys.venue.all, queryKeys.venue.list()],
  });

  /**
   * Create a brand new venue on-chain.
   * Returns the new venue ID on success.
   */
  const createVenue = useCallback(
    async (params: {
      name: string;
      metadata?: string;
      venueFeeBps?: number;
      creatorFeeBps?: number;
      defaultTickSize?: string;
      tradingAccessControl?: `0x${string}`;
      creationAccessControl?: `0x${string}`;
    }): Promise<bigint | undefined> => {
      if (!address || !publicClient) return;

      setIsSettingUp(true);
      try {
        // Read nextVenueId before creation — the new venue will get this ID
        const nextIdBefore = (await publicClient.readContract({
          address: DIAMOND_ADDRESS,
          abi: VenueFacetABI,
          functionName: "getNextVenueId",
        })) as bigint;

        const hash = await execute(() =>
          client.venue.createVenue({
            name: params.name,
            metadata: params.metadata || "",
            tradingAccessControl:
              params.tradingAccessControl ??
              "0x0000000000000000000000000000000000000000",
            creationAccessControl:
              params.creationAccessControl ??
              "0x0000000000000000000000000000000000000000",
            feeRecipient: address,
            venueFeeBps: params.venueFeeBps ?? 50, // 0.5% default
            creatorFeeBps: params.creatorFeeBps ?? 0,
            defaultTickSize: parseEther(params.defaultTickSize || "0.01"),
            marketCreationFee: parseUnits("5", 6), // 5 USDC minimum
            umaRewardAmount: parseUnits("5", 6), // 5 USDC reward for asserters
            umaMinBond: parseUnits("750", 6), // 750 USDC bond (Polymarket standard)
          }),
        );

        if (hash) {
          return nextIdBefore;
        }
      } finally {
        setIsSettingUp(false);
      }
    },
    [address, publicClient, client, execute],
  );

  return {
    venueId,
    createVenue,
    isCreating: isCreating || isSettingUp,
    createError,
  };
}
