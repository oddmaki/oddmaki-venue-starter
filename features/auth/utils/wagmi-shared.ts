/**
 * Shared Wagmi Configuration
 *
 * Chain and transport config reused by all auth provider adapters.
 * Each adapter imports these to build its own wagmi config.
 */

import { http } from "wagmi";

import { ACTIVE_CHAIN } from "@/lib/oddmaki/chain";

export const supportedChains = [ACTIVE_CHAIN] as const;

export const transports = {
  [ACTIVE_CHAIN.id]: http(),
} as const;
