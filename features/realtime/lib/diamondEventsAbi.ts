/**
 * Merged Diamond Events ABI
 *
 * Extracts all event entries from the 13 Diamond facet ABIs and deduplicates
 * by event name. Used as the single ABI for watchContractEvent on the Diamond
 * proxy address.
 */

import {
  VenueFacetABI,
  MarketsFacetABI,
  LimitOrdersFacetABI,
  MatchingFacetABI,
  OrderBookFacetABI,
  MarketGroupFacetABI,
  MarketOrdersFacetABI,
  ResolutionFacetABI,
  VaultFacetABI,
  NegRiskFacetABI,
  ProtocolFacetABI,
  AccessControlFacetABI,
  TagsFacetABI,
} from "@oddmaki-protocol/sdk";

type AbiItem = { type: string; name?: string; [key: string]: unknown };

const ALL_FACET_ABIS: AbiItem[][] = [
  VenueFacetABI as AbiItem[],
  MarketsFacetABI as AbiItem[],
  LimitOrdersFacetABI as AbiItem[],
  MatchingFacetABI as AbiItem[],
  OrderBookFacetABI as AbiItem[],
  MarketGroupFacetABI as AbiItem[],
  MarketOrdersFacetABI as AbiItem[],
  ResolutionFacetABI as AbiItem[],
  VaultFacetABI as AbiItem[],
  NegRiskFacetABI as AbiItem[],
  ProtocolFacetABI as AbiItem[],
  AccessControlFacetABI as AbiItem[],
  TagsFacetABI as AbiItem[],
];

// Extract only event entries and deduplicate by name
const seen = new Set<string>();

export const diamondEventsAbi = ALL_FACET_ABIS.flatMap((abi) =>
  abi.filter((item) => {
    if (item.type !== "event") return false;
    const name = item.name as string;

    if (seen.has(name)) return false;
    seen.add(name);

    return true;
  }),
);
