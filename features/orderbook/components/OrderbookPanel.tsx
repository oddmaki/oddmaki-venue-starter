"use client";

import { useState, useMemo } from "react";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Skeleton } from "@heroui/skeleton";

import { useOrderbookLevels } from "../hooks/useOrderbookLevels";

import { OrderbookRow } from "./OrderbookRow";

import { RefreshButton } from "@/lib/oddmaki/RefreshButton";

interface OrderbookPanelProps {
  marketId: string;
  tickSize: string;
  outcomes: string[];
  onPriceClick?: (price: string, tick: bigint, side: "bid" | "ask") => void;
}

export function OrderbookPanel({
  marketId,
  tickSize,
  outcomes,
  onPriceClick,
}: OrderbookPanelProps) {
  const [outcomeIndex, setOutcomeIndex] = useState(0);
  const { data, isLoading, isFetching, refetch, error } = useOrderbookLevels(
    marketId,
    outcomeIndex,
    tickSize,
  );

  // Compute max cumulative for depth bar scaling
  const maxCumulative = useMemo(() => {
    if (!data) return BigInt(1);
    const allLevels = [...data.bids, ...data.asks];

    if (allLevels.length === 0) return BigInt(1);

    return allLevels.reduce(
      (max, l) => (l.cumulativeRaw > max ? l.cumulativeRaw : max),
      BigInt(1),
    );
  }, [data]);

  return (
    <Card className="h-full">
      <CardHeader className="flex justify-between items-center pb-0 gap-2 flex-wrap">
        <h2 className="text-lg font-semibold">Orderbook</h2>
        <div className="flex items-center gap-1">
          <Button
            color={outcomeIndex === 0 ? "primary" : "default"}
            size="sm"
            variant={outcomeIndex === 0 ? "solid" : "flat"}
            onPress={() => setOutcomeIndex(0)}
          >
            {outcomes[0] || "Yes"}
          </Button>
          <Button
            color={outcomeIndex === 1 ? "secondary" : "default"}
            size="sm"
            variant={outcomeIndex === 1 ? "solid" : "flat"}
            onPress={() => setOutcomeIndex(1)}
          >
            {outcomes[1] || "No"}
          </Button>
          <RefreshButton isFetching={isFetching} onRefresh={() => refetch()} />
        </div>
      </CardHeader>

      <CardBody className="px-0 pb-2 flex-1">
        {isLoading ? (
          <OrderbookSkeleton />
        ) : error ? (
          <div className="flex items-center justify-center h-full text-sm text-danger-400">
            Failed to load orderbook
          </div>
        ) : !data || (data.bids.length === 0 && data.asks.length === 0) ? (
          <div className="flex items-center justify-center h-full text-sm text-default-400">
            No orders yet
          </div>
        ) : (
          <div className="flex flex-col">
            {/* Column headers */}
            <div className="flex items-center h-7 px-2 text-[10px] uppercase text-default-400 font-semibold">
              <span className="w-[25%] sm:w-[40%]" />
              <span className="flex-1 text-center">Price</span>
              <span className="flex-1 text-right">Qty</span>
              <span className="w-[60px] sm:w-[70px] text-right">Total</span>
            </div>

            {/* Asks — chip on last row (closest to spread) */}
            {data.asks.map((level, i) => (
              <OrderbookRow
                key={`ask-${level.tick.toString()}`}
                depthRatio={Number(level.cumulativeRaw) / Number(maxCumulative)}
                label={
                  i === data.asks.length - 1
                    ? { text: "Asks", color: "secondary" }
                    : undefined
                }
                level={level}
                side="ask"
                onPriceClick={(price, tick) =>
                  onPriceClick?.(price, tick, "ask")
                }
              />
            ))}

            {/* Spread row — last price left, spread center */}
            <div className="flex items-center h-7 px-2 border-y border-default-200 text-xs text-default-400">
              <span className="w-[25%] sm:w-[40%] truncate">
                {data.bestBidPrice ? `Last: ${data.bestBidPrice}` : ""}
              </span>
              <span className="flex-1 text-center truncate">
                {data.spread !== null
                  ? `Spread: ${data.spread}`
                  : "No spread data"}
              </span>
              <span className="w-[60px] sm:w-[70px]" />
            </div>

            {/* Bids — chip on first row (closest to spread) */}
            {data.bids.map((level, i) => (
              <OrderbookRow
                key={`bid-${level.tick.toString()}`}
                depthRatio={Number(level.cumulativeRaw) / Number(maxCumulative)}
                label={i === 0 ? { text: "Bids", color: "primary" } : undefined}
                level={level}
                side="bid"
                onPriceClick={(price, tick) =>
                  onPriceClick?.(price, tick, "bid")
                }
              />
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}

function OrderbookSkeleton() {
  return (
    <div className="flex flex-col gap-1 px-2 py-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={`ask-sk-${i}`} className="w-full h-7 rounded-md" />
      ))}
      <div className="h-7" />
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={`bid-sk-${i}`} className="w-full h-7 rounded-md" />
      ))}
    </div>
  );
}
