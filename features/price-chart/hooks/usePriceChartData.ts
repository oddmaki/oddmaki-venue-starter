"use client";

import type { Timeframe } from "../lib/timeframes";
import type { ChartDataPoint } from "../lib/aggregation";

import { useQuery } from "@tanstack/react-query";

import {
  tradesToChartData,
  deduplicateByTimestamp,
  downsampleLTTB,
  padToTimeWindow,
  CHART_MAX_POINTS,
} from "../lib/aggregation";
import { getTimestampFrom, getTimeframeWindow } from "../lib/timeframes";

import { useOddMakiClient } from "@/lib/oddmaki/hooks";
import { queryKeys } from "@/lib/oddmaki/queryKeys";

export interface PriceChartResult {
  data: ChartDataPoint[];
  timeWindow: { start: number | undefined; end: number };
  currentPrice: number | undefined;
}

export function usePriceChartData(
  marketId: string,
  tickSize: string,
  timeframe: Timeframe,
  fallbackPrice?: number,
) {
  const client = useOddMakiClient();

  return useQuery<PriceChartResult>({
    queryKey: queryKeys.trades.chart(marketId, timeframe.key),
    queryFn: async () => {
      const timestampGte = getTimestampFrom(timeframe);
      const timeWindow = getTimeframeWindow(timeframe);

      const result = (await client.public.getChartTrades({
        marketId: BigInt(marketId),
        timestampGte,
        first: 1000,
      })) as any;

      const trades = result.trades || [];
      const points = tradesToChartData(trades, tickSize);
      const deduplicated = deduplicateByTimestamp(points);
      const downsampled = downsampleLTTB(deduplicated, CHART_MAX_POINTS);

      // Current price = last real data point, falling back to parent's lastPriceTick
      const currentPrice =
        downsampled.length > 0
          ? downsampled[downsampled.length - 1].value
          : fallbackPrice;

      // Pad to fill the full time window
      // For ALL: use first data point's time as start (or 1 day before now)
      const effectiveStart =
        timeWindow.start ??
        (downsampled.length > 0 ? downsampled[0].time : timeWindow.end - 86400);

      const padded = padToTimeWindow(
        downsampled,
        effectiveStart,
        timeWindow.end,
        fallbackPrice,
      );

      return { data: padded, timeWindow, currentPrice };
    },
    enabled: !!marketId && !!tickSize,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
