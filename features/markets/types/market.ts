/**
 * Market-related types based on subgraph data structure (Diamond v0.1.0)
 */

export enum MarketStatus {
  DRAFT = "Draft",
  ACTIVE = "Active",
  RESOLVED = "Resolved",
  INVALID = "Invalid",
}

/**
 * Raw market data from subgraph
 */
export interface Market {
  // Identifiers
  id: string;
  marketId: string;
  conditionId: string;

  // Core data
  question: string;
  outcomes: string[];
  status: MarketStatus;
  collateralToken: string;

  // Last trade prices (tick values from orderbook)
  lastPriceTick_0: string;
  lastPriceTick_1: string;
  lastTradeTimestamp: string;
  lastTradeTimestamp_0?: string;
  lastTradeTimestamp_1?: string;

  // Top of book for mark price calculation
  topOfBook?: Array<{
    outcome: string;
    side: string;
    topTick: string;
  }>;

  // Market parameters
  tickSize: string;

  // Tags
  tags: string[];

  // Metadata
  metadataURI: string;

  // Statistics
  totalVolume: string;
  totalOrders: string;
  uniqueTraders: string;
}

/**
 * Formatted market with computed price percentages for display
 */
export interface FormattedMarket extends Market {
  // Human-readable prices (0-100%)
  yesPrice: number;
  noPrice: number;
  // Volume in human-readable format
  volumeFormatted: string;
}
