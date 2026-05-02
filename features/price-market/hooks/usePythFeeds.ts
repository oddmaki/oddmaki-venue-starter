"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/oddmaki/queryKeys";

/** Shape of a single feed from Hermes /v2/price_feeds */
interface HermesPythFeed {
  id: string;
  attributes: {
    asset_type: string;
    symbol: string;
    display_symbol: string;
    base: string;
    description: string;
    quote_currency: string;
  };
}

/** Normalized feed for UI consumption */
export interface PythFeedOption {
  feedId: `0x${string}`;
  displaySymbol: string;
  base: string;
  description: string;
  assetType: string;
  quoteCurrency: string;
}

export interface GroupedPythFeeds {
  [assetType: string]: PythFeedOption[];
}

const HERMES_FEEDS_URL = "https://hermes.pyth.network/v2/price_feeds";

async function fetchPythFeeds(): Promise<PythFeedOption[]> {
  const res = await fetch(HERMES_FEEDS_URL);

  if (!res.ok) throw new Error(`Failed to fetch Pyth feeds: ${res.status}`);
  const data: HermesPythFeed[] = await res.json();

  return data.map((f) => ({
    feedId: `0x${f.id}` as `0x${string}`,
    displaySymbol: f.attributes.display_symbol,
    base: f.attributes.base,
    description: f.attributes.description,
    assetType: f.attributes.asset_type,
    quoteCurrency: f.attributes.quote_currency,
  }));
}

function groupByAssetType(feeds: PythFeedOption[]): GroupedPythFeeds {
  const groups: GroupedPythFeeds = {};

  for (const feed of feeds) {
    const type = feed.assetType || "Other";

    if (!groups[type]) groups[type] = [];
    groups[type].push(feed);
  }
  for (const type of Object.keys(groups)) {
    groups[type].sort((a, b) => a.displaySymbol.localeCompare(b.displaySymbol));
  }

  return groups;
}

export function usePythFeeds() {
  const query = useQuery({
    queryKey: queryKeys.pyth.feeds(),
    queryFn: fetchPythFeeds,
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const grouped = query.data ? groupByAssetType(query.data) : {};
  const assetTypes = Object.keys(grouped).sort();

  return {
    feeds: query.data ?? [],
    grouped,
    assetTypes,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
