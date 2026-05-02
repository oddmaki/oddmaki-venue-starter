"use client";

import type { Timeframe } from "../lib/timeframes";

import { useState } from "react";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Skeleton } from "@heroui/skeleton";

import { usePriceChartData } from "../hooks/usePriceChartData";
import { TIMEFRAMES, DEFAULT_TIMEFRAME } from "../lib/timeframes";

import { PriceChart } from "./PriceChart";

interface PriceChartPanelProps {
  marketId: string;
  tickSize: string;
  outcomes: string[];
  lastPriceTick?: string;
}

export function PriceChartPanel({
  marketId,
  tickSize,
  outcomes,
  lastPriceTick,
}: PriceChartPanelProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>(DEFAULT_TIMEFRAME);

  const fallbackPrice = (() => {
    if (!lastPriceTick || !tickSize) return undefined;
    const tickSizeNum = parseFloat(tickSize);
    const tickNum = parseFloat(lastPriceTick);

    if (tickSizeNum === 0 || tickNum === 0) return undefined;

    return (tickNum * tickSizeNum) / 1e18;
  })();

  const { data: chartResult, isLoading } = usePriceChartData(
    marketId,
    tickSize,
    timeframe,
    fallbackPrice,
  );

  const hasNoDataEver =
    !chartResult ||
    (chartResult.data.length === 0 && fallbackPrice === undefined);

  return (
    <Card>
      <CardHeader className="flex justify-end items-center pb-0">
        <div className="flex items-center gap-1">
          {TIMEFRAMES.map((tf) => (
            <Button
              key={tf.key}
              className="min-w-0 px-2"
              color={timeframe.key === tf.key ? "primary" : "default"}
              size="sm"
              variant={timeframe.key === tf.key ? "solid" : "flat"}
              onPress={() => setTimeframe(tf)}
            >
              {tf.label}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardBody className="pt-2">
        {isLoading ? (
          <PriceChartSkeleton />
        ) : hasNoDataEver ? (
          <div className="flex items-center justify-center h-[300px] text-sm text-default-400">
            No trade data available
          </div>
        ) : (
          <PriceChart
            currentPrice={chartResult!.currentPrice}
            data={chartResult!.data}
            height={300}
            outcomeLabel={outcomes[0] || "Yes"}
            timeWindow={chartResult!.timeWindow}
            timeframeKey={timeframe.key}
          />
        )}
      </CardBody>
    </Card>
  );
}

function PriceChartSkeleton() {
  return (
    <div className="h-[300px] flex flex-col justify-end gap-1 px-4 pb-4">
      <Skeleton className="w-full h-2 rounded" />
      <Skeleton className="w-[85%] h-2 rounded" />
      <Skeleton className="w-[92%] h-2 rounded" />
      <Skeleton className="w-[78%] h-2 rounded" />
      <Skeleton className="w-[88%] h-2 rounded" />
      <Skeleton className="w-[95%] h-2 rounded" />
      <Skeleton className="w-full h-2 rounded" />
    </div>
  );
}
