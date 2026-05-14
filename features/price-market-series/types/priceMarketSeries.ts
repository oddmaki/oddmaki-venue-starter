import type { MarketStatus } from "../../markets/types";

export interface PriceMarketSeriesMarket {
  id: string;
  marketId: string;
  question: string;
  status: MarketStatus;
  resolvedOutcome: number | null;
  outcomes: string[];
  openTime: string;
  closeTime: string;
  resolved: boolean;
  outcome: string | null;
  finalPrice: string | null;
  strikePrice: string | null;
}

export interface FormattedPriceMarketSeries {
  id: string;
  seriesKey: string;
  asset: string;
  kind: string;
  interval: string;
  intervalSeconds: number;
  status: MarketStatus;
  tags: string[];
  title: string;
  createdAt: string;
  updatedAt: string;
  currentMarketId: string | null;
  currentMarket: {
    marketId: string;
    question: string;
    outcomes: string[];
    yesPrice: number;
    noPrice: number;
    metadataURI: string | null;
    closeTime: string;
    openTime: string;
  } | null;
  venueId: string;
  markets?: PriceMarketSeriesMarket[];
}
