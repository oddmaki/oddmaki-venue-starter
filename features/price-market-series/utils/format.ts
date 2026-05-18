import type { FormattedPriceMarketSeries } from "../types";

import { calculateMarketPrices } from "@/features/markets/utils/formatting";

const KIND_DISPLAY: Record<string, string> = {
  updown: "Up or Down",
  strike: "Strike",
};

// Interval aliases — anything not in here renders the raw segment ("5m", "15m", "1h", ...).
const INTERVAL_DISPLAY: Record<string, string> = {
  "24h": "Daily",
  "1440m": "Daily",
  "1d": "Daily",
  "7d": "Weekly",
  "1w": "Weekly",
};

/**
 * Parse a seriesKey of the form "<asset>-<kind>-<interval>" into its parts.
 *
 * The asset segment may itself contain hyphens when the bot slugifies a quoted
 * symbol ("DOGE/USD" → "doge-usd"), so we treat the last segment as the
 * interval, the second-to-last as the kind, and join everything before as the
 * asset.
 */
export function parseSeriesKey(seriesKey: string): {
  asset: string;
  kind: string;
  interval: string;
} {
  const parts = seriesKey.split("-").filter(Boolean);

  if (parts.length < 3) {
    return { asset: seriesKey, kind: "", interval: "" };
  }

  const interval = parts[parts.length - 1];
  const kind = parts[parts.length - 2];
  const asset = parts.slice(0, parts.length - 2).join("-");

  return { asset, kind, interval };
}

/**
 * Render a slugified asset segment for display. Hyphens are interpreted as
 * pair separators (`doge-usd` → `DOGE/USD`); a bare asset is uppercased.
 */
function displayAsset(asset: string): string {
  if (!asset) return "";
  if (asset.includes("-")) {
    return asset
      .split("-")
      .map((p) => p.toUpperCase())
      .join("/");
  }

  return asset.toUpperCase();
}

function displayKind(kind: string): string {
  return KIND_DISPLAY[kind] ?? kind;
}

function displayInterval(interval: string): string {
  return INTERVAL_DISPLAY[interval] ?? interval;
}

export function buildSeriesTitle(seriesKey: string): string {
  const { asset, kind, interval } = parseSeriesKey(seriesKey);
  const left = [displayAsset(asset), displayKind(kind)]
    .filter(Boolean)
    .join(" ");
  const right = displayInterval(interval);

  return right ? `${left} — ${right}` : left;
}

export function formatPriceMarketSeries(raw: any): FormattedPriceMarketSeries {
  const current = raw.currentMarket;
  let formattedCurrent: FormattedPriceMarketSeries["currentMarket"] = null;

  if (current) {
    const { yesPrice, noPrice } = calculateMarketPrices(current);

    formattedCurrent = {
      marketId: current.marketId,
      question: current.question ?? "",
      outcomes: current.outcomes ?? ["Up", "Down"],
      yesPrice,
      noPrice,
      metadataURI: current.metadataURI ?? null,
      closeTime: current.priceMarket?.closeTime ?? "0",
      openTime: current.priceMarket?.openTime ?? "0",
    };
  }

  return {
    id: raw.id,
    seriesKey: raw.seriesKey,
    asset: raw.asset,
    kind: raw.kind,
    interval: raw.interval,
    intervalSeconds: Number(raw.intervalSeconds ?? 0),
    status: raw.status,
    tags: raw.tags ?? [],
    title: buildSeriesTitle(raw.seriesKey ?? ""),
    createdAt: raw.createdAt ?? "0",
    updatedAt: raw.updatedAt ?? "0",
    currentMarketId: current?.id ?? null,
    currentMarket: formattedCurrent,
    venueId: raw.venue?.venueId ?? "",
    markets: raw.markets?.map((m: any) => ({
      id: m.id,
      marketId: m.marketId,
      question: m.question,
      status: m.status,
      resolvedOutcome: m.resolvedOutcome ?? null,
      outcomes: m.outcomes ?? [],
      openTime: m.priceMarket?.openTime ?? "0",
      closeTime: m.priceMarket?.closeTime ?? "0",
      resolved: m.priceMarket?.resolved ?? false,
      outcome: m.priceMarket?.outcome ?? null,
      finalPrice: m.priceMarket?.finalPrice ?? null,
      strikePrice: m.priceMarket?.strikePrice ?? null,
    })),
  };
}
