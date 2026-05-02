/**
 * Contract Addresses
 *
 * Re-exports contract addresses for the chain selected via
 * `NEXT_PUBLIC_CHAIN_ID` (see `lib/oddmaki/chain.ts`).
 */

import { CONTRACT_ADDRESSES } from "@oddmaki-protocol/sdk";

import {
  ACTIVE_CHAIN,
  ACTIVE_CHAIN_ID,
  ACTIVE_CONTRACTS,
} from "@/lib/oddmaki/chain";

// Re-export for easy access throughout the app
export const contracts = CONTRACT_ADDRESSES;
export const defaultChain = ACTIVE_CHAIN;

// Type-safe contract address access for a specific chain
export function getContractsForChain(chainId: keyof typeof CONTRACT_ADDRESSES) {
  return CONTRACT_ADDRESSES[chainId];
}

// Get contracts for the active chain
export function getDefaultContracts() {
  return ACTIVE_CONTRACTS;
}

export { ACTIVE_CHAIN_ID };
