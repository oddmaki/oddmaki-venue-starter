"use client";

import type {
  FormattedPriceMarketSeries,
  PriceMarketSeriesMarket,
} from "../types";

import { useMemo } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";

interface TimeWindowStripProps {
  series: FormattedPriceMarketSeries;
  /** Market id currently being viewed (highlighted in the strip) */
  selectedMarketId: string;
}

// Polymarket-style chip window centred on the *selected* market:
// 1 past + selected + 2 upcoming = 4 chips, sliding to fit at list edges.
const CHIPS_BEFORE_SELECTED = 1;
const CHIPS_AFTER_SELECTED = 2;
const TOTAL_CHIPS = CHIPS_BEFORE_SELECTED + 1 + CHIPS_AFTER_SELECTED;
// Dropdowns show up to N entries beyond the chip window.
const DROPDOWN_LIMIT = 8;

function formatTime(closeTimeSec: string): string {
  const ms = Number(closeTimeSec) * 1000;

  if (!Number.isFinite(ms) || ms <= 0) return "—";

  return new Date(ms).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Returns true if the market resolved Up (outcome 0), false if Down,
 * and null if unresolved or indeterminate.
 */
function resolvedUp(market: PriceMarketSeriesMarket): boolean | null {
  if (!market.resolved) return null;
  if (market.resolvedOutcome === 0) return true;
  if (market.resolvedOutcome === 1) return false;
  if (market.outcome) return market.outcome.toLowerCase() === "up";

  return null;
}

function ResultGlyph({ market }: { market: PriceMarketSeriesMarket }) {
  const up = resolvedUp(market);

  if (up === true) {
    return (
      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-success/20 text-[10px] text-success">
        ▲
      </span>
    );
  }
  if (up === false) {
    return (
      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-danger/20 text-[10px] text-danger">
        ▼
      </span>
    );
  }

  return <span className="inline-block h-2 w-2 rounded-full bg-default-300" />;
}

function ResultDot({ market }: { market: PriceMarketSeriesMarket }) {
  const up = resolvedUp(market);

  if (up === true)
    return (
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-success" />
    );
  if (up === false)
    return <span className="inline-block h-1.5 w-1.5 rounded-full bg-danger" />;

  return (
    <span className="inline-block h-1.5 w-1.5 rounded-full bg-default-300" />
  );
}

function isTradeable(market: PriceMarketSeriesMarket, nowSec: number): boolean {
  const open = Number(market.openTime);
  const close = Number(market.closeTime);

  if (!Number.isFinite(open) || !Number.isFinite(close)) return false;

  return nowSec >= open && nowSec < close && !market.resolved;
}

export function TimeWindowStrip({
  series,
  selectedMarketId,
}: TimeWindowStripProps) {
  // Captured once per render; we only need wall-clock granularity for time-window
  // membership, not high-frequency updates.
  const nowSec = Math.floor(Date.now() / 1000);

  const { chips, pastWindow, futureWindow } = useMemo(() => {
    const sorted = (series.markets ?? [])
      .slice()
      .sort((a, b) => Number(a.closeTime) - Number(b.closeTime));

    // Centre the chip window on the selected market when present; otherwise
    // fall back to the tail of the list (the "no live, no upcoming" case the
    // user described — show the last 4 with a Past dropdown for older ones).
    let selectedIdx = sorted.findIndex((m) => m.marketId === selectedMarketId);

    if (selectedIdx < 0) selectedIdx = sorted.length - 1;

    let chipStart = Math.max(0, selectedIdx - CHIPS_BEFORE_SELECTED);
    let chipEnd = Math.min(sorted.length, chipStart + TOTAL_CHIPS);

    if (chipEnd - chipStart < TOTAL_CHIPS) {
      chipStart = Math.max(0, chipEnd - TOTAL_CHIPS);
    }

    const chipSlice = sorted.slice(chipStart, chipEnd);
    const past = sorted.slice(
      Math.max(0, chipStart - DROPDOWN_LIMIT),
      chipStart,
    );
    const future = sorted.slice(chipEnd, chipEnd + DROPDOWN_LIMIT);

    return {
      chips: chipSlice,
      pastWindow: past,
      futureWindow: future,
    };
  }, [series.markets, selectedMarketId]);

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 px-1 py-2">
      {pastWindow.length > 0 && <PastDropdown items={pastWindow} />}

      {chips.map((m) => (
        <ChipLink
          key={m.id}
          isLive={isTradeable(m, nowSec)}
          isSelected={m.marketId === selectedMarketId}
          market={m}
        />
      ))}

      {futureWindow.length > 0 && <MoreDropdown items={futureWindow} />}
    </div>
  );
}

function ChipLink({
  market,
  isLive,
  isSelected,
}: {
  market: PriceMarketSeriesMarket;
  isLive: boolean;
  isSelected: boolean;
}) {
  const label = formatTime(market.closeTime);

  let className =
    "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ";

  if (isSelected && isLive) {
    className += "bg-foreground/90 text-background";
  } else if (isSelected) {
    className += "bg-default-200 text-foreground";
  } else if (market.resolved) {
    className += "bg-default-50 text-default-500 hover:bg-default-100";
  } else {
    className += "bg-default-100 text-default-700 hover:bg-default-200";
  }

  return (
    <NextLink className={className} href={`/market/${market.marketId}`}>
      {isLive && (
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-danger animate-pulse" />
      )}
      {!isLive && market.resolved && <ResultDot market={market} />}
      {label}
    </NextLink>
  );
}

function PastDropdown({ items }: { items: PriceMarketSeriesMarket[] }) {
  const router = useRouter();
  // Recent-first in the menu.
  const ordered = useMemo(() => items.slice().reverse(), [items]);

  return (
    <Dropdown placement="bottom-start">
      <DropdownTrigger>
        <button
          className="inline-flex items-center gap-1 rounded-md bg-default-100 px-3 py-1.5 text-xs font-medium text-default-700 hover:bg-default-200"
          type="button"
        >
          Past
          <ChevronIcon />
        </button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Past windows"
        items={ordered}
        onAction={(key) => router.push(`/market/${key}`)}
      >
        {(m) => {
          const market = m as PriceMarketSeriesMarket;

          return (
            <DropdownItem
              key={market.marketId}
              endContent={
                <span className="text-default-400 text-xs">Today</span>
              }
              startContent={<ResultGlyph market={market} />}
              textValue={`${formatTime(market.closeTime)} ET`}
            >
              <span className="font-medium">
                {formatTime(market.closeTime)}
              </span>
              <span className="ml-1 text-default-400">ET</span>
            </DropdownItem>
          );
        }}
      </DropdownMenu>
    </Dropdown>
  );
}

function MoreDropdown({ items }: { items: PriceMarketSeriesMarket[] }) {
  const router = useRouter();

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <button
          className="inline-flex items-center gap-1 rounded-md bg-default-100 px-3 py-1.5 text-xs font-medium text-default-700 hover:bg-default-200"
          type="button"
        >
          More
          <ChevronIcon />
        </button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Upcoming windows"
        items={items}
        onAction={(key) => router.push(`/market/${key}`)}
      >
        {(m) => {
          const market = m as PriceMarketSeriesMarket;

          return (
            <DropdownItem
              key={market.marketId}
              endContent={
                <span className="text-default-400 text-xs">Today</span>
              }
              startContent={
                <span className="inline-block h-2 w-2 rounded-full bg-default-300" />
              }
              textValue={`${formatTime(market.closeTime)} ET`}
            >
              <span className="font-medium">
                {formatTime(market.closeTime)}
              </span>
              <span className="ml-1 text-default-400">ET</span>
            </DropdownItem>
          );
        }}
      </DropdownMenu>
    </Dropdown>
  );
}

function ChevronIcon() {
  return (
    <svg
      aria-hidden
      className="h-3 w-3"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        d="M19 9l-7 7-7-7"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </svg>
  );
}
