/**
 * Curated Pyth Price Feed IDs
 *
 * Feed IDs from: https://pyth.network/developers/price-feed-ids
 * These are mainnet feed IDs (same across all EVM chains).
 */

export interface PythFeed {
  id: `0x${string}`;
  name: string;
  symbol: string;
  /** Typical exponent (e.g., -8 means price * 10^-8) */
  expo: number;
}

export const PYTH_FEEDS: PythFeed[] = [
  {
    id: "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
    name: "Ethereum",
    symbol: "ETH/USD",
    expo: -8,
  },
  {
    id: "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43",
    name: "Bitcoin",
    symbol: "BTC/USD",
    expo: -8,
  },
  {
    id: "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d",
    name: "Solana",
    symbol: "SOL/USD",
    expo: -8,
  },
];

export const PYTH_FEED_MAP = new Map(PYTH_FEEDS.map((f) => [f.id, f]));

/** Duration presets in seconds */
export const DURATION_PRESETS = [
  { label: "5m", value: 300 },
  { label: "15m", value: 900 },
  { label: "30m", value: 1800 },
  { label: "1h", value: 3600 },
  { label: "4h", value: 14400 },
  { label: "24h", value: 86400 },
] as const;
