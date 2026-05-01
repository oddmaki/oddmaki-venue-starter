/**
 * Active Chain Resolution
 *
 * Selects the chain this venue runs against from `NEXT_PUBLIC_CHAIN_ID`.
 * Defaults to Base mainnet. Throws at module load if the chain id is set
 * but unsupported, so misconfiguration fails fast in dev/CI rather than
 * surfacing as opaque on-chain errors at runtime.
 */

import type { Chain } from "viem";

import { base, baseSepolia } from "viem/chains";
import { CONTRACT_ADDRESSES } from "@oddmaki-protocol/sdk";

const SUPPORTED_CHAINS = {
  [base.id]: base,
  [baseSepolia.id]: baseSepolia,
} as const;

type SupportedChainId = keyof typeof SUPPORTED_CHAINS;

function resolveChainId(): SupportedChainId {
  const raw = process.env.NEXT_PUBLIC_CHAIN_ID;

  if (!raw) return base.id;

  const parsed = Number(raw);

  if (!(parsed in SUPPORTED_CHAINS)) {
    throw new Error(
      `NEXT_PUBLIC_CHAIN_ID=${raw} is not supported. Use one of: ${Object.keys(SUPPORTED_CHAINS).join(", ")}`,
    );
  }

  return parsed as SupportedChainId;
}

export const ACTIVE_CHAIN_ID: SupportedChainId = resolveChainId();
export const ACTIVE_CHAIN: Chain = SUPPORTED_CHAINS[ACTIVE_CHAIN_ID];
export const ACTIVE_CONTRACTS = CONTRACT_ADDRESSES[ACTIVE_CHAIN_ID];

/** True when the active chain is a testnet — gates dev-only UI like the USDC mint button. */
export const IS_TESTNET = Boolean(ACTIVE_CHAIN.testnet);
