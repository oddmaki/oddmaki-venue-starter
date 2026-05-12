import type { AccessControlType } from "@/features/access-control/hooks/useDeployAccessControl";

export type MarketType = "standard" | "group" | "price";

export type TickSize = "0.01" | "0.001";

export interface MarketTypeOption {
  id: MarketType;
  label: string;
  tagline: string;
  description: string;
  examples: string[];
}

export const MARKET_TYPES: MarketTypeOption[] = [
  {
    id: "standard",
    label: "Binary Market",
    tagline: "A single YES / NO question",
    description:
      "A standalone binary market with exactly two complementary outcomes that price 0–1 and sum to 1. Resolved by UMA. Best for one-shot questions where there are only two possible answers.",
    examples: [
      "Will BTC reach $100k by end of 2026?",
      "Will Apple ship a foldable iPhone in 2026?",
      "Will Brazil win the 2026 World Cup?",
    ],
  },
  {
    id: "group",
    label: "Market Group",
    tagline: "Up to 50 mutually exclusive outcomes",
    description:
      "A bundle of binary markets that share a single question, where exactly one outcome can resolve YES (NegRisk). Each outcome becomes its own binary market and you can convert positions across them. Supports 2–50 outcomes per group.",
    examples: [
      "Who will win the 2028 US Presidential Election? (one outcome per candidate)",
      "Where will Giannis be traded? (one outcome per team)",
      "When will the Fed cut rates next? (one outcome per FOMC meeting)",
    ],
  },
  {
    id: "price",
    label: "Price Market",
    tagline: "Pyth-powered automatic resolution",
    description:
      "A binary market that resolves automatically from a Pyth Network price feed at a fixed close time. Use Up/Down vs. price at creation, or Above/Below an explicit strike. No UMA assertion required.",
    examples: [
      "ETH 24h close above open?",
      "BTC ≥ $100,000 on Jan 1, 2027?",
      "SOL above $250 in the next 4 hours?",
    ],
  },
];

// =====================================================================
// Standard market
// =====================================================================

export type StandardWizardStep =
  | "question"
  | "outcomes"
  | "settings"
  | "access-control"
  | "review";

export const STANDARD_WIZARD_STEPS: {
  id: StandardWizardStep;
  number: number;
  label: string;
  description: string;
}[] = [
  {
    id: "question",
    number: 1,
    label: "Question",
    description: "Define the market question and resolution criteria.",
  },
  {
    id: "outcomes",
    number: 2,
    label: "Outcome labels",
    description:
      "Binary markets always have two complementary outcomes. Use Yes/No or pick custom labels.",
  },
  {
    id: "settings",
    number: 3,
    label: "Trading & Oracle",
    description:
      "Tick size, optional UMA reward boost, challenge period, and tags.",
  },
  {
    id: "access-control",
    number: 4,
    label: "Access Control",
    description:
      "Override the venue trading access control for this market only.",
  },
  {
    id: "review",
    number: 5,
    label: "Review",
    description:
      "Confirm and submit. The market is created on-chain immediately.",
  },
];

export interface StandardMarketFormData {
  title: string;
  description: string;
  outcomeMode: "binary" | "custom";
  outcomes: string[];
  tickSize: TickSize;
  additionalReward: number;
  liveness: number;
  tags: string[];
  tradingACType: AccessControlType;
  tradingACCustomAddress: string;
  tradingACNftContract: string;
  tradingACNftTokenId: string;
  tradingACTokenContract: string;
  tradingACTokenMinBalance: string;
}

export const DEFAULT_STANDARD_FORM: StandardMarketFormData = {
  title: "",
  description: "",
  outcomeMode: "binary",
  outcomes: ["Yes", "No"],
  tickSize: "0.01",
  additionalReward: 0,
  liveness: 0,
  tags: [],
  tradingACType: "public",
  tradingACCustomAddress: "",
  tradingACNftContract: "",
  tradingACNftTokenId: "0",
  tradingACTokenContract: "",
  tradingACTokenMinBalance: "",
};

// =====================================================================
// Group market
// =====================================================================

export type GroupWizardStep = "info" | "outcomes" | "settings" | "review";

export const GROUP_WIZARD_STEPS: {
  id: GroupWizardStep;
  number: number;
  label: string;
  description: string;
}[] = [
  {
    id: "info",
    number: 1,
    label: "Group Info",
    description:
      "Shared question and resolution criteria for all outcomes in the group.",
  },
  {
    id: "outcomes",
    number: 2,
    label: "Outcomes",
    description:
      "Add at least 2 mutually-exclusive outcomes. Each becomes a binary market.",
  },
  {
    id: "settings",
    number: 3,
    label: "Trading & Oracle",
    description:
      "Tick size, UMA reward boost, placeholders, activation timing, and tags.",
  },
  {
    id: "review",
    number: 4,
    label: "Review",
    description:
      "Confirm and submit. The group, markets, and activation run as a single flow.",
  },
];

export interface GroupOutcome {
  name: string;
  question: string;
}

export interface GroupMarketFormData {
  title: string;
  description: string;
  outcomes: GroupOutcome[];
  tickSize: TickSize;
  additionalReward: number;
  liveness: number;
  placeholderCount: number;
  activateImmediately: boolean;
  tags: string[];
}

export const DEFAULT_GROUP_FORM: GroupMarketFormData = {
  title: "",
  description: "",
  outcomes: [
    { name: "", question: "" },
    { name: "", question: "" },
  ],
  tickSize: "0.01",
  additionalReward: 0,
  liveness: 0,
  placeholderCount: 0,
  activateImmediately: true,
  tags: [],
};

// =====================================================================
// Price market (Pyth)
// =====================================================================

export type PriceWizardStep = "feed" | "window" | "meta" | "review";

export const PRICE_WIZARD_STEPS: {
  id: PriceWizardStep;
  number: number;
  label: string;
  description: string;
}[] = [
  {
    id: "feed",
    number: 1,
    label: "Price Feed",
    description:
      "Choose a Pyth price feed and decide between Up/Down or strike-based resolution.",
  },
  {
    id: "window",
    number: 2,
    label: "Close Time",
    description:
      "When the market closes and the Pyth price is captured to settle the market.",
  },
  {
    id: "meta",
    number: 3,
    label: "Question & Trading",
    description: "Auto-generated title and description, tick size, and tags.",
  },
  {
    id: "review",
    number: 4,
    label: "Review",
    description:
      "Confirm and submit. Price markets resolve automatically against Pyth at close.",
  },
];

export interface PriceMarketFormData {
  pythFeedId: string;
  feedSymbol: string;
  priceExpo: number;
  useStrikePrice: boolean;
  strikePrice: string;
  closeMode: "preset" | "custom";
  presetSeconds: number;
  customDatetime: string;
  customTimezone: string;
  tickSize: TickSize;
  liveness: number;
  resolutionWindow: number;
  title: string;
  description: string;
  tags: string[];
}

export const DEFAULT_PRICE_FORM: PriceMarketFormData = {
  pythFeedId: "",
  feedSymbol: "",
  priceExpo: -8,
  useStrikePrice: false,
  strikePrice: "",
  closeMode: "preset",
  presetSeconds: 3600,
  customDatetime: "",
  customTimezone: "local",
  tickSize: "0.01",
  liveness: 0,
  resolutionWindow: 0,
  title: "",
  description: "",
  tags: ["price-market"],
};
