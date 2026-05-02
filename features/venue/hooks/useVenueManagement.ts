"use client";

import { useOddMakiClient } from "@/lib/oddmaki/hooks";
import { useTransaction } from "@/lib/oddmaki/useTransaction";
import { queryKeys } from "@/lib/oddmaki/queryKeys";
import { getVenueId } from "@/config/venue.config";

export function useUpdateVenueFees() {
  const client = useOddMakiClient();
  const venueId = getVenueId();

  const { execute, isLoading, error } = useTransaction({
    pendingMessage: "Updating venue fees...",
    successMessage: "Venue fees updated!",
    errorMessage: "Failed to update fees",
    invalidateKeys: [queryKeys.venue.all],
  });

  const updateFees = async (venueFeeBps: number, creatorFeeBps: number) => {
    if (venueId === undefined) return;

    return execute(() =>
      client.venue.updateFees({ venueId, venueFeeBps, creatorFeeBps }),
    );
  };

  return { updateFees, isLoading, error };
}

export function useUpdateOracleParams() {
  const client = useOddMakiClient();
  const venueId = getVenueId();

  const { execute, isLoading, error } = useTransaction({
    pendingMessage: "Updating oracle params...",
    successMessage: "Oracle params updated!",
    errorMessage: "Failed to update oracle params",
    invalidateKeys: [queryKeys.venue.all],
  });

  const updateOracleParams = async (
    umaRewardAmount: bigint,
    umaMinBond: bigint,
  ) => {
    if (venueId === undefined) return;

    return execute(() =>
      client.venue.updateOracleParams({ venueId, umaRewardAmount, umaMinBond }),
    );
  };

  return { updateOracleParams, isLoading, error };
}

export function useToggleVenuePause() {
  const client = useOddMakiClient();
  const venueId = getVenueId();

  const { execute, isLoading, error } = useTransaction({
    pendingMessage: "Updating venue status...",
    successMessage: "Venue status updated!",
    errorMessage: "Failed to update venue status",
    invalidateKeys: [queryKeys.venue.all],
  });

  const togglePause = async (currentlyActive: boolean) => {
    if (venueId === undefined) return;

    return execute(() => client.venue.setPaused(venueId, currentlyActive));
  };

  return { togglePause, isLoading, error };
}

export function useUpdateVenue() {
  const client = useOddMakiClient();
  const venueId = getVenueId();

  const { execute, isLoading, error } = useTransaction({
    pendingMessage: "Updating venue...",
    successMessage: "Venue updated!",
    errorMessage: "Failed to update venue",
    invalidateKeys: [queryKeys.venue.all],
  });

  const updateVenue = async (params: {
    name: string;
    metadata: string;
    tradingAccessControl: `0x${string}`;
    creationAccessControl: `0x${string}`;
    feeRecipient: `0x${string}`;
  }) => {
    if (venueId === undefined) return;

    return execute(() => client.venue.updateVenue({ venueId, ...params }));
  };

  return { updateVenue, isLoading, error };
}
