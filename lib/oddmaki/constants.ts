/**
 * Protocol Constants
 *
 * Common constants used across venue-app features. Contract addresses
 * are resolved from `NEXT_PUBLIC_CHAIN_ID` via `./chain`.
 */

import type { Address } from "viem";

import { ACTIVE_CONTRACTS } from "./chain";

export const MAX_UINT256 = BigInt(
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
);

export const DIAMOND_ADDRESS: Address = ACTIVE_CONTRACTS.diamond;
export const USDC_ADDRESS: Address = ACTIVE_CONTRACTS.usdc;
export const CTF_ADDRESS: Address = ACTIVE_CONTRACTS.conditionalTokens;

/** USDC uses 6 decimals */
export const USDC_DECIMALS = 6;
