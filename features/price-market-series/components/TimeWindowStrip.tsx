"use client";

import type {
  FormattedPriceMarketSeries,
  PriceMarketSeriesMarket,
} from "../types";

import { useMemo } from "react";
import NextLink from "next/link";

interface TimeWindowStripProps {
  series: FormattedPriceMarketSeries;
  /** Market id currently being viewed (highlighted in the strip) */
  selectedMarketId: string;
}

const VISIBLE_PAST = 2;
const VISIBLE_FUTURE = 3;

function formatWindowLabel(closeTimeSec: string): string {
  const ms = Number(closeTimeSec) * 1000;

  if (!Number.isFinite(ms) || ms <= 0) return "—";

  return new Date(ms).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Strip of time-window buttons below the chart, allowing the user to navigate
 * to past/current/future markets in the same price series. Polymarket-style.
 */
export function TimeWindowStrip({
  series,
  selectedMarketId,
}: TimeWindowStripProps) {
  const windows = useMemo(() => {
    const all = (series.markets ?? []).slice().sort((a, b) => {
      const ac = Number(a.closeTime);
      const bc = Number(b.closeTime);

      return ac - bc;
    });

    // Anchor the visible slice on whatever the user is currently viewing so
    // navigation feels continuous when stepping through past/future windows.
    const anchorIdx = all.findIndex((m) => m.marketId === selectedMarketId);

    if (anchorIdx < 0) return all;

    const start = Math.max(0, anchorIdx - VISIBLE_PAST);
    const end = Math.min(all.length, anchorIdx + VISIBLE_FUTURE + 1);

    return all.slice(start, end);
  }, [series.markets, selectedMarketId]);

  if (windows.length <= 1) return null;

  const hasMorePast =
    (series.markets ?? []).length > 0 &&
    Number(windows[0]?.closeTime) >
      Number((series.markets ?? [])[0]?.closeTime ?? "0");
  const hasMoreFuture =
    (series.markets ?? []).length > 0 &&
    Number(windows[windows.length - 1]?.closeTime) <
      Number(
        (series.markets ?? [])[(series.markets ?? []).length - 1]?.closeTime ??
          "0",
      );

  return (
    <div className="flex flex-wrap items-center gap-2 px-1 py-2">
      {hasMorePast && (
        <button
          disabled
          className="rounded-md bg-default-100 px-3 py-1.5 text-xs font-medium text-default-500 hover:bg-default-200"
          type="button"
        >
          Past
        </button>
      )}
      {windows.map((w) => (
        <TimeWindowButton
          key={w.id}
          isCurrent={w.marketId === series.currentMarket?.marketId}
          isSelected={w.marketId === selectedMarketId}
          window={w}
        />
      ))}
      {hasMoreFuture && (
        <button
          disabled
          className="rounded-md bg-default-100 px-3 py-1.5 text-xs font-medium text-default-500 hover:bg-default-200"
          type="button"
        >
          More
        </button>
      )}
    </div>
  );
}

function TimeWindowButton({
  window,
  isSelected,
  isCurrent,
}: {
  window: PriceMarketSeriesMarket;
  isSelected: boolean;
  isCurrent: boolean;
}) {
  const label = formatWindowLabel(window.closeTime);
  // Visual states:
  // - Selected (viewing now): white-ish background, strong contrast
  // - Current (live, but not selected): primary accent dot
  // - Resolved: muted
  // - Future: standard pill
  let className =
    "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ";

  if (isSelected) {
    className += "bg-default-200 text-foreground";
  } else if (window.resolved) {
    className += "bg-default-50 text-default-400 hover:bg-default-100";
  } else {
    className += "bg-default-100 text-default-600 hover:bg-default-200";
  }

  return (
    <NextLink className={className} href={`/market/${window.marketId}`}>
      {isCurrent && !isSelected && (
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-danger animate-pulse" />
      )}
      {label}
    </NextLink>
  );
}
