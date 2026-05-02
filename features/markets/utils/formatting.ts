/**
 * Shared formatting utilities for market price/volume display.
 */

import {
  calculateChancePercent,
  tickToPercentage,
  type ChancePercentInput,
} from "@oddmaki-protocol/sdk";

// Re-export tickToPercentage for backward compatibility
export { tickToPercentage };

/**
 * Calculate market prices using Polymarket-style mark price waterfall.
 * Returns { yesPrice, noPrice } as percentages (0-100).
 */
export function calculateMarketPrices(market: ChancePercentInput): {
  yesPrice: number;
  noPrice: number;
} {
  const yesPrice = calculateChancePercent(market);

  return {
    yesPrice,
    noPrice: parseFloat((100 - yesPrice).toFixed(2)),
  };
}

/**
 * Format market volume to human-readable string
 * Volume is in base units (e.g., USDC with 6 decimals), so divide by 1e6
 */
export function formatVolume(volume: string, decimals: number = 6): string {
  const vol = parseFloat(volume) / Math.pow(10, decimals);

  if (vol === 0) return "$0";
  if (vol >= 1_000_000) return `$${(vol / 1_000_000).toFixed(1)}M`;
  if (vol >= 1_000) return `$${(vol / 1_000).toFixed(1)}K`;

  return `$${vol.toFixed(0)}`;
}
