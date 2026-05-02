"use client";

import type { Abi } from "viem";

import { useQuery } from "@tanstack/react-query";
import { usePublicClient } from "wagmi";
import { OrderBookFacetABI } from "@oddmaki-protocol/sdk";

import { queryKeys } from "@/lib/oddmaki/queryKeys";
import { DIAMOND_ADDRESS, USDC_DECIMALS } from "@/lib/oddmaki/constants";

export interface OrderbookLevel {
  price: string; // e.g. "0.65"
  tick: bigint;
  quantity: string; // formatted total qty
  quantityRaw: bigint;
  orders: number; // depth (number of orders at this level)
  cumulative: string; // cumulative quantity
  cumulativeRaw: bigint;
}

export interface OrderbookData {
  bids: OrderbookLevel[];
  asks: OrderbookLevel[];
  spread: string | null;
  bestBidPrice: string | null;
  bestAskPrice: string | null;
}

const MAX_LEVELS = 10;
const MAX_TICK_SCAN = 30; // Max ticks to scan from top of book

function tickToPrice(tick: bigint, tickSize: bigint): string {
  const price = Number(tick * tickSize) / 1e18;

  return price.toFixed(2);
}

function formatQty(qty: bigint, decimals: number = USDC_DECIMALS): string {
  const formatted = Number(qty) / Math.pow(10, decimals);

  if (formatted === 0) return "0";
  if (formatted >= 1_000_000) return `${(formatted / 1_000_000).toFixed(1)}M`;
  if (formatted >= 1_000) return `${(formatted / 1_000).toFixed(1)}K`;
  if (formatted < 0.01) return formatted.toFixed(4);

  return formatted.toFixed(2);
}

const orderbookContract = {
  address: DIAMOND_ADDRESS,
  abi: OrderBookFacetABI as Abi,
} as const;

/**
 * Hook to fetch orderbook levels (bids + asks) for a given market + outcome.
 *
 * Uses multicall to batch all on-chain reads into 2 RPC calls instead of 60+.
 * Bids walk downward from best bid, asks walk upward from best ask.
 */
export function useOrderbookLevels(
  marketId: string,
  outcomeIndex: number,
  tickSize: string,
) {
  const publicClient = usePublicClient();
  const tickSizeBigInt = BigInt(tickSize || "0");

  return useQuery<OrderbookData>({
    queryKey: queryKeys.orderbook.byMarket(BigInt(marketId), outcomeIndex),
    queryFn: async () => {
      if (!publicClient) throw new Error("No public client");
      const marketIdBig = BigInt(marketId);
      const outcomeId = BigInt(outcomeIndex);

      // Batch 1: Get top-of-book for bid and ask sides (2 calls → 1 RPC)
      const [topBidResult, topAskResult] = await publicClient.multicall({
        contracts: [
          {
            ...orderbookContract,
            functionName: "getTopOfBook",
            args: [marketIdBig, outcomeId, 0], // BUY side
          },
          {
            ...orderbookContract,
            functionName: "getTopOfBook",
            args: [marketIdBig, outcomeId, 1], // SELL side
          },
        ],
      });

      const topBidTick =
        topBidResult.status === "success"
          ? (topBidResult.result as bigint)
          : BigInt(0);
      const topAskTick =
        topAskResult.status === "success"
          ? (topAskResult.result as bigint)
          : BigInt(0);

      // Build tick scan ranges for both sides
      const bidTicks: bigint[] = [];

      if (topBidTick > BigInt(0)) {
        for (let i = 0; i < MAX_TICK_SCAN; i++) {
          const tick = topBidTick - BigInt(i);

          if (tick <= BigInt(0)) break;
          bidTicks.push(tick);
        }
      }

      const askTicks: bigint[] = [];

      if (topAskTick > BigInt(0)) {
        for (let i = 0; i < MAX_TICK_SCAN; i++) {
          const tick = topAskTick + BigInt(i);

          if (tick > BigInt(100)) break; // Max tick is 100 (price $1.00)
          askTicks.push(tick);
        }
      }

      // Batch 2: Get all tick levels in a single multicall (up to 60 calls → 1 RPC)
      const tickContracts = [
        ...bidTicks.map((tick) => ({
          ...orderbookContract,
          functionName: "getTickLevel" as const,
          args: [marketIdBig, outcomeId, 0, tick] as const, // BUY side
        })),
        ...askTicks.map((tick) => ({
          ...orderbookContract,
          functionName: "getTickLevel" as const,
          args: [marketIdBig, outcomeId, 1, tick] as const, // SELL side
        })),
      ];

      let bidResults: Array<{ status: string; result?: any }> = [];
      let askResults: Array<{ status: string; result?: any }> = [];

      if (tickContracts.length > 0) {
        const allResults = await publicClient.multicall({
          contracts: tickContracts,
        });

        bidResults = allResults.slice(0, bidTicks.length) as any;
        askResults = allResults.slice(bidTicks.length) as any;
      }

      // Process bid levels
      const bids: OrderbookLevel[] = [];

      for (let i = 0; i < bidTicks.length; i++) {
        const result = bidResults[i];

        if (result.status !== "success") continue;
        const lev = result.result as any;
        const totalQty = lev.totalQty as bigint;

        if (totalQty > BigInt(0)) {
          bids.push({
            price: tickToPrice(bidTicks[i], tickSizeBigInt),
            tick: bidTicks[i],
            quantity: formatQty(totalQty),
            quantityRaw: totalQty,
            orders: Number(lev.depth),
            cumulative: "0",
            cumulativeRaw: BigInt(0),
          });
        }
        if (bids.length >= MAX_LEVELS) break;
      }

      // Process ask levels
      const asks: OrderbookLevel[] = [];

      for (let i = 0; i < askTicks.length; i++) {
        const result = askResults[i];

        if (result.status !== "success") continue;
        const lev = result.result as any;
        const totalQty = lev.totalQty as bigint;

        if (totalQty > BigInt(0)) {
          asks.push({
            price: tickToPrice(askTicks[i], tickSizeBigInt),
            tick: askTicks[i],
            quantity: formatQty(totalQty),
            quantityRaw: totalQty,
            orders: Number(lev.depth),
            cumulative: "0",
            cumulativeRaw: BigInt(0),
          });
        }
        if (asks.length >= MAX_LEVELS) break;
      }

      // Calculate cumulative quantities
      let cumBid = BigInt(0);

      for (const bid of bids) {
        cumBid += bid.quantityRaw;
        bid.cumulativeRaw = cumBid;
        bid.cumulative = formatQty(cumBid);
      }

      let cumAsk = BigInt(0);

      for (const ask of asks) {
        cumAsk += ask.quantityRaw;
        ask.cumulativeRaw = cumAsk;
        ask.cumulative = formatQty(cumAsk);
      }

      // Calculate spread
      let spread: string | null = null;
      const bestBidPrice =
        topBidTick > BigInt(0) ? tickToPrice(topBidTick, tickSizeBigInt) : null;
      const bestAskPrice =
        topAskTick > BigInt(0) ? tickToPrice(topAskTick, tickSizeBigInt) : null;

      if (bestBidPrice && bestAskPrice) {
        spread = (parseFloat(bestAskPrice) - parseFloat(bestBidPrice)).toFixed(
          2,
        );
      }

      return {
        bids,
        asks: asks.reverse(), // Reverse so highest ask is at bottom (closest to spread)
        spread,
        bestBidPrice,
        bestAskPrice,
      };
    },
    enabled: !!marketId && tickSizeBigInt > BigInt(0) && !!publicClient,
    staleTime: 5_000,
    refetchInterval: 10_000,
  });
}
