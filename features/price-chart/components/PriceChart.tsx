"use client";

import type { ChartDataPoint } from "../lib/aggregation";

import { useEffect, useRef, useState, useCallback, memo } from "react";
import {
  createChart,
  createSeriesMarkers,
  ColorType,
  CrosshairMode,
  LineSeries,
  type IChartApi,
  type ISeriesApi,
  type ISeriesMarkersPluginApi,
  type MouseEventParams,
} from "lightweight-charts";

import { colors, alpha } from "@/lib/tokens";

interface PriceChartProps {
  data: ChartDataPoint[];
  timeWindow: { start: number | undefined; end: number };
  timeframeKey: string;
  currentPrice?: number;
  outcomeLabel?: string;
  height?: number;
}

/**
 * Format a unix timestamp for the time axis based on the active timeframe.
 * - 1H, 6H, 1D: "3:00 PM" style
 * - 1W, 1M: "Mar 14" style
 * - ALL: "Mar 14" for short spans, "Jan" for long spans
 */
function formatTimeLabel(
  unixSeconds: number,
  timeframeKey: string,
  windowStart?: number,
): string {
  const date = new Date(unixSeconds * 1000);

  if (["1H", "6H", "1D"].includes(timeframeKey)) {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  if (timeframeKey === "ALL" && windowStart !== undefined) {
    const spanSeconds = unixSeconds - windowStart;

    // > 3 months → show month only
    if (spanSeconds > 90 * 86400) {
      return date.toLocaleDateString("en-US", { month: "short" });
    }
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export const PriceChart = memo(function PriceChart({
  data,
  timeWindow,
  timeframeKey,
  currentPrice,
  outcomeLabel = "Yes",
  height = 300,
}: PriceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  const seriesRef = useRef<ISeriesApi<any> | null>(null);

  const markersRef = useRef<ISeriesMarkersPluginApi<any> | null>(null);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    price: number;
  }>({ visible: false, x: 0, y: 0, price: 0 });

  const handleCrosshairMove = useCallback((param: MouseEventParams) => {
    if (!param.point || !seriesRef.current) {
      setTooltip((prev) => (prev.visible ? { ...prev, visible: false } : prev));

      return;
    }

    const seriesData = param.seriesData?.get(seriesRef.current);

    if (!seriesData || !("value" in seriesData)) {
      setTooltip((prev) => (prev.visible ? { ...prev, visible: false } : prev));

      return;
    }

    const value = (seriesData as any).value as number;

    setTooltip({
      visible: true,
      x: param.point.x,
      y: param.point.y,
      price: value,
    });
  }, []);

  // Initialize chart
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#a1a1aa",
      },
      width: containerRef.current.clientWidth,
      height,
      grid: {
        vertLines: { color: "rgba(255, 255, 255, 0.04)" },
        horzLines: { color: "rgba(255, 255, 255, 0.04)" },
      },
      crosshair: {
        mode: CrosshairMode.Magnet,
        vertLine: {
          color: alpha(colors.neonCyan, 0.3),
          width: 1,
          style: 0,
          labelVisible: false,
        },
        horzLine: {
          color: alpha(colors.neonCyan, 0.3),
          width: 1,
          style: 0,
          labelVisible: true,
          labelBackgroundColor: colors.neonCyan,
        },
      },
      rightPriceScale: {
        borderVisible: false,
        scaleMargins: { top: 0.1, bottom: 0.05 },
      },
      timeScale: {
        borderVisible: false,
        timeVisible: true,
        secondsVisible: false,
        fixLeftEdge: true,
        rightOffset: 3,
      },
      handleScroll: false,
      handleScale: false,
    });

    const lineSeries = chart.addSeries(LineSeries, {
      color: colors.neonCyan,
      lineWidth: 3,
      priceFormat: {
        type: "custom",
        formatter: (price: number) => `${(price * 100).toFixed(0)}%`,
        minMove: 0.01,
      },
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 4,
      crosshairMarkerBorderColor: colors.neonCyan,
      crosshairMarkerBackgroundColor: colors.neonCyan,
      crosshairMarkerBorderWidth: 2,
    });

    const markers = createSeriesMarkers(lineSeries, []);

    chartRef.current = chart;
    seriesRef.current = lineSeries;
    markersRef.current = markers;

    // Hide TradingView branding watermark
    const branding = containerRef.current.querySelector(
      'a[href*="tradingview"]',
    ) as HTMLElement | null;

    if (branding) branding.style.display = "none";

    chart.subscribeCrosshairMove(handleCrosshairMove);

    const container = containerRef.current;
    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];

      if (entry && chartRef.current) {
        chartRef.current.applyOptions({
          width: entry.contentRect.width,
        });
      }
    });

    resizeObserver.observe(container);

    return () => {
      chart.unsubscribeCrosshairMove(handleCrosshairMove);
      markers.detach();
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
      markersRef.current = null;
    };
  }, [height, handleCrosshairMove]);

  // Update data when it changes
  useEffect(() => {
    if (!seriesRef.current || !chartRef.current) return;

    seriesRef.current.setData(
      data.map((d) => ({
        time: d.time as any,
        value: d.value,
      })),
    );

    // Current price dot at the last data point
    if (markersRef.current) {
      if (currentPrice !== undefined && data.length > 0) {
        const lastPoint = data[data.length - 1];

        markersRef.current.setMarkers([
          {
            time: lastPoint.time as any,
            position: "inBar",
            shape: "circle",
            color: colors.neonCyan,
            size: 1,
          },
        ]);
      } else {
        markersRef.current.setMarkers([]);
      }
    }

    // Update time axis formatting for this timeframe
    chartRef.current.applyOptions({
      timeScale: {
        tickMarkFormatter: (time: any) =>
          formatTimeLabel(time as number, timeframeKey, timeWindow.start),
      },
    });

    // Fit content to show full padded data range
    if (data.length > 0) {
      chartRef.current.timeScale().fitContent();
    }
  }, [data, timeWindow, timeframeKey, currentPrice]);

  return (
    <div ref={containerRef} className="w-full relative">
      {tooltip.visible && (
        <div
          className="absolute pointer-events-none z-10"
          style={{
            left: tooltip.x,
            top: tooltip.y - 32,
            transform: "translateX(-50%)",
          }}
        >
          <div
            className="px-2 py-1 rounded text-xs font-semibold whitespace-nowrap"
            style={{
              backgroundColor: alpha(colors.neonCyan, 0.15),
              color: colors.neonCyan,
              border: `1px solid ${alpha(colors.neonCyan, 0.3)}`,
            }}
          >
            {outcomeLabel} {(tooltip.price * 100).toFixed(0)}%
          </div>
        </div>
      )}
    </div>
  );
});
