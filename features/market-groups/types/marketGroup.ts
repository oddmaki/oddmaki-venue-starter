export enum MarketGroupStatus {
  DRAFT = "Draft",
  ACTIVE = "Active",
  RESOLVED = "Resolved",
}

/** Formatted child market/outcome for display */
export interface FormattedGroupOutcome {
  marketId: string;
  name: string; // from marketGroupItem.marketName
  question: string;
  probability: number; // 0-100
  status: string;
  totalVolume: string;
  volumeFormatted: string;
  isPlaceholder: boolean;
}

/** Formatted market group for display */
export interface FormattedMarketGroup {
  groupId: string;
  marketQuestion: string;
  status: MarketGroupStatus;
  totalMarkets: string;
  activeMarketCount: string;
  resolvedMarketId: string;
  tags: string[];
  createdAt: string;
  activatedAt: string | null;
  resolvedAt: string | null;
  creator: string;
  outcomes: FormattedGroupOutcome[];
  totalVolume: string;
  volumeFormatted: string;
}
