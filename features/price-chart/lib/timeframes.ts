export interface Timeframe {
  key: string;
  label: string;
  durationSeconds: number | null; // null = "All"
}

export const TIMEFRAMES: Timeframe[] = [
  { key: "1H", label: "1H", durationSeconds: 3600 },
  { key: "6H", label: "6H", durationSeconds: 21600 },
  { key: "1D", label: "1D", durationSeconds: 86400 },
  { key: "1W", label: "1W", durationSeconds: 604800 },
  { key: "1M", label: "1M", durationSeconds: 2592000 },
  { key: "ALL", label: "ALL", durationSeconds: null },
];

export const DEFAULT_TIMEFRAME = TIMEFRAMES[3]; // 1W

/**
 * Calculate the "from" timestamp for a given timeframe.
 * Returns undefined for "All" (no lower bound).
 */
export function getTimestampFrom(timeframe: Timeframe): bigint | undefined {
  if (timeframe.durationSeconds === null) return undefined;
  const now = Math.floor(Date.now() / 1000);

  return BigInt(now - timeframe.durationSeconds);
}

/**
 * Get the [start, end] unix timestamps (seconds) for a timeframe window.
 * Returns start=undefined for "All" (no lower bound).
 */
export function getTimeframeWindow(timeframe: Timeframe): {
  start: number | undefined;
  end: number;
} {
  const now = Math.floor(Date.now() / 1000);

  if (timeframe.durationSeconds === null) {
    return { start: undefined, end: now };
  }

  return { start: now - timeframe.durationSeconds, end: now };
}
