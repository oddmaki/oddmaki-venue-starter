const PRICE_MARKET_TAG = "price-market";
const SERIES_TAG_PREFIX = "series:";

/**
 * Extract the seriesKey from a market's tags.
 *
 * A market belongs to a price series iff its tags contain both "price-market"
 * and a "series:<key>" tag. Mirrors the subgraph mapping's extractSeriesKey
 * helper — kept here so the client doesn't depend on a built SDK release.
 */
export function extractSeriesKey(
  tags: string[] | undefined | null,
): string | null {
  if (!tags?.length) return null;
  let hasPriceMarketTag = false;
  let seriesKey: string | null = null;

  for (const tag of tags) {
    if (tag === PRICE_MARKET_TAG) hasPriceMarketTag = true;
    else if (tag.startsWith(SERIES_TAG_PREFIX)) {
      seriesKey = tag.slice(SERIES_TAG_PREFIX.length);
    }
  }

  return hasPriceMarketTag ? seriesKey : null;
}
