import type { FormattedPriceMarketSeries } from "../types";

import { calculateMarketPrices } from "@/features/markets/utils/formatting";

const ASSET_DISPLAY: Record<string, string> = {
  btc: "BTC",
  eth: "ETH",
  sol: "SOL",
  xrp: "XRP",
  doge: "DOGE",
  hype: "HYPE",
  bnb: "BNB",
};

const KIND_DISPLAY: Record<string, string> = {
  updown: "Up or Down",
  strike: "Strike",
};

function displayAsset(asset: string): string {
  return ASSET_DISPLAY[asset] ?? asset.toUpperCase();
}

function displayKind(kind: string): string {
  return KIND_DISPLAY[kind] ?? kind;
}

export function buildSeriesTitle(
  asset: string,
  kind: string,
  interval: string,
): string {
  return `${displayAsset(asset)} ${displayKind(kind)} ${interval}`;
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
    title: buildSeriesTitle(raw.asset, raw.kind, raw.interval),
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
