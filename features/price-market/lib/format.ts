/**
 * Shared formatting utilities for price market data.
 */

/** Format a raw Pyth price (bigint) with its exponent to a human-readable string. */
export function formatPythPrice(rawPrice: bigint, expo: number): string {
  const factor = Math.pow(10, expo);

  return (Number(rawPrice) * factor).toFixed(
    Math.abs(expo) > 4 ? 2 : Math.abs(expo),
  );
}

/** Format a countdown from a target unix timestamp (bigint, seconds). */
export function formatCountdown(targetTime: bigint): string {
  const now = Math.floor(Date.now() / 1000);
  const remaining = Number(targetTime) - now;

  if (remaining <= 0) return "Expired";

  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;

  return `${seconds}s`;
}

/** Format a number as a dollar price with appropriate precision. */
export function formatDollarPrice(price: number): string {
  if (price >= 100) {
    return price.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  if (price >= 1) {
    return price.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    });
  }

  return price.toLocaleString("en-US", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 6,
  });
}
