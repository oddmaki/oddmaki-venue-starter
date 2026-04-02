'use client';

import { useRef, useMemo } from 'react';
import type { ChartDataPoint } from '@/features/price-chart/lib/aggregation';
import { usePythLivePrice } from './usePythLivePrice';

const MAX_BUFFER_SIZE = 500;

/**
 * Accumulates live Pyth price updates into a chart-ready time series.
 * Starts collecting immediately so data is available when the user switches
 * to the price tab.
 */
export function usePythPriceHistory(feedId: string | undefined) {
  const bufferRef = useRef<ChartDataPoint[]>([]);
  const lastPublishTimeRef = useRef<number>(0);

  const { data: livePrice, isLoading } = usePythLivePrice(feedId);

  // Append new data point when publishTime changes
  if (livePrice && livePrice.publishTime !== lastPublishTimeRef.current) {
    lastPublishTimeRef.current = livePrice.publishTime;

    bufferRef.current.push({
      time: livePrice.publishTime,
      value: livePrice.price,
    });

    // Trim oldest points if buffer exceeds max size
    if (bufferRef.current.length > MAX_BUFFER_SIZE) {
      bufferRef.current = bufferRef.current.slice(-MAX_BUFFER_SIZE);
    }
  }

  const data = useMemo(
    () => [...bufferRef.current],
    // Re-derive when a new point is added (tracked via publishTime)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [livePrice?.publishTime],
  );

  return {
    data,
    currentPrice: livePrice?.price,
    isLoading,
  };
}
