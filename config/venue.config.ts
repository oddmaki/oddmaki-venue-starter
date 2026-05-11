/**
 * Venue Configuration
 *
 * venueId comes exclusively from the NEXT_PUBLIC_VENUE_ID env var.
 * If not set, VenueSetupGuard shows a notice instructing the developer
 * to set the env var and restart.
 */

import { ACTIVE_CHAIN_ID } from "@/lib/oddmaki/chain";

const envVenueIdRaw = process.env.NEXT_PUBLIC_VENUE_ID;
const envVenueId =
  envVenueIdRaw !== undefined && envVenueIdRaw !== ""
    ? BigInt(envVenueIdRaw)
    : undefined;

/**
 * Get the configured venueId from the NEXT_PUBLIC_VENUE_ID env var.
 * Returns undefined when no venueId is configured.
 */
export function getVenueId(): bigint | undefined {
  return envVenueId;
}

export const venueConfig = {
  // Venue identification - use getVenueId() at runtime for client code
  venueId: envVenueId,

  // Branding & UI
  branding: {
    name: process.env.NEXT_PUBLIC_VENUE_NAME || "OddMaki Markets",
    description: "Trade on prediction markets powered by OddMaki Protocol",
    logo: "/logo.svg",
    favicon: "/favicon.svg",
    // Note: Theme colors are configured in theme.config.json
  },

  // Network settings — driven by NEXT_PUBLIC_CHAIN_ID (see lib/oddmaki/chain.ts)
  network: {
    defaultChainId: ACTIVE_CHAIN_ID,
    supportedChains: [ACTIVE_CHAIN_ID],
  },

  // UI settings
  ui: {
    marketsPerPage: 12,
    enableAnimations: true,
    defaultTheme: "dark" as const,
  },
} as const;

export type VenueConfig = typeof venueConfig;
