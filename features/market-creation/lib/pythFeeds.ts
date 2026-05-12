export interface PythFeed {
  id: `0x${string}`;
  name: string;
  symbol: string;
  expo: number;
}

export const PYTH_FEEDS: PythFeed[] = [
  {
    id: "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
    name: "Ethereum",
    symbol: "ETH/USD",
    expo: -8,
  },
  {
    id: "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43",
    name: "Bitcoin",
    symbol: "BTC/USD",
    expo: -8,
  },
  {
    id: "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d",
    name: "Solana",
    symbol: "SOL/USD",
    expo: -8,
  },
];

export const PYTH_FEED_MAP = new Map(PYTH_FEEDS.map((f) => [f.id, f]));

export const PYTH_DURATION_PRESETS: { label: string; seconds: number }[] = [
  { label: "5m", seconds: 300 },
  { label: "15m", seconds: 900 },
  { label: "30m", seconds: 1800 },
  { label: "1h", seconds: 3600 },
  { label: "4h", seconds: 14400 },
  { label: "24h", seconds: 86400 },
];

export const PYTH_FEED_ID_REGEX = /^0x[0-9a-fA-F]{64}$/;
export const PYTH_HERMES_BASE = "https://hermes.pyth.network";

export interface PythLatest {
  price: number;
  expo: number;
}

export async function fetchPythLatest(
  feedId: string,
  signal?: AbortSignal,
): Promise<PythLatest | null> {
  try {
    const res = await fetch(
      `${PYTH_HERMES_BASE}/v2/updates/price/latest?ids[]=${feedId}`,
      { signal },
    );

    if (!res.ok) return null;
    const data: { parsed?: { price?: { price?: string; expo?: number } }[] } =
      await res.json();
    const parsed = data.parsed?.[0]?.price;

    if (!parsed?.price) return null;
    const expo = parsed.expo ?? -8;

    return { price: Number(parsed.price) * Math.pow(10, expo), expo };
  } catch {
    return null;
  }
}
