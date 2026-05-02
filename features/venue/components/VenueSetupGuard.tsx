"use client";

import type { ReactNode } from "react";

import { VenueSetupModal } from "./VenueSetupModal";

import { getVenueId } from "@/config/venue.config";

interface VenueSetupGuardProps {
  children: ReactNode;
}

/**
 * Shows VenueSetupModal if NEXT_PUBLIC_VENUE_ID is not configured.
 * The modal is permanent — user must set the env var and restart.
 */
export function VenueSetupGuard({ children }: VenueSetupGuardProps) {
  const venueId = getVenueId();

  if (venueId === undefined) {
    return <VenueSetupModal />;
  }

  return <>{children}</>;
}
