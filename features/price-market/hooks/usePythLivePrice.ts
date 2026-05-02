"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/oddmaki/queryKeys";

const PYTH_HERMES_BASE = "https://hermes.pyth.network";

export interface PythLivePrice {
  /** Human-readable price (e.g., 67432.15) */
  price: number;
  /** Unix timestamp of the price publication */
  publishTime: number;
  /** Confidence interval in the same unit as price */
  confidence: number;
}

async function fetchPythLatestPrice(feedId: string): Promise<PythLivePrice> {
  const res = await fetch(
    `${PYTH_HERMES_BASE}/v2/updates/price/latest?ids[]=${feedId}`,
  );

  if (!res.ok) {
    throw new Error(`Pyth Hermes error (${res.status})`);
  }
  const data = await res.json();
  const parsed = data?.parsed?.[0];

  if (!parsed?.price) {
    throw new Error("No price data returned from Pyth");
  }

  const expo = parsed.price.expo as number;
  const factor = Math.pow(10, expo);

  return {
    price: Number(parsed.price.price) * factor,
    publishTime: parsed.price.publish_time as number,
    confidence: Number(parsed.price.conf) * factor,
  };
}

/**
 * Poll Pyth Hermes for the latest price of a given feed.
 * Updates every 5 seconds.
 */
export function usePythLivePrice(feedId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.pyth.livePrice(feedId ?? ""),
    queryFn: () => fetchPythLatestPrice(feedId!),
    enabled: !!feedId,
    refetchInterval: 5_000,
    staleTime: 3_000,
  });
}
