"use client";

import type {
  PriceMarketData,
  ProjectedOpenPrice,
} from "@oddmaki-protocol/sdk";
import type { Timeframe } from "@/features/price-chart/lib/timeframes";

import { useState } from "react";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Skeleton } from "@heroui/skeleton";

import { PYTH_FEED_MAP } from "../constants/pythFeeds";
import { usePythPriceHistory } from "../hooks/usePythPriceHistory";
import { usePythLivePrice } from "../hooks/usePythLivePrice";

import { PriceInfoHeader } from "./PriceInfoHeader";
import { CountdownTimer } from "./CountdownTimer";

import { PriceChart } from "@/features/price-chart/components/PriceChart";
import { AssetPriceChart } from "@/features/price-chart/components/AssetPriceChart";
import {
  ChartTabSwitcher,
  type ChartTab,
} from "@/features/price-chart/components/ChartTabSwitcher";
import { usePriceChartData } from "@/features/price-chart/hooks/usePriceChartData";
import {
  TIMEFRAMES,
  DEFAULT_TIMEFRAME,
} from "@/features/price-chart/lib/timeframes";

interface PriceMarketChartSectionProps {
  marketId: string;
  tickSize: string;
  outcomes: string[];
  lastPriceTick?: string;
  priceMarketData: PriceMarketData;
  /**
   * For deferred Up/Down markets the on-chain strike is 0 until resolution.
   * Pass the SDK-projected open price (derived from Hermes using the same rule
   * the contract will apply) so the UI can render a meaningful strike before
   * resolution. `null` for resolved or explicit-strike markets.
   */
  projectedOpenPrice?: ProjectedOpenPrice | null;
}

export function PriceMarketChartSection({
  marketId,
  tickSize,
  outcomes,
  lastPriceTick,
  priceMarketData,
  projectedOpenPrice,
}: PriceMarketChartSectionProps) {
  const [activeTab, setActiveTab] = useState<ChartTab>("probability");
  const [timeframe, setTimeframe] = useState<Timeframe>(DEFAULT_TIMEFRAME);

  // Feed metadata
  const feed = PYTH_FEED_MAP.get(priceMarketData.feedId);
  const feedSymbol = feed?.symbol;
  // Live Pyth price (always active for the header)
  const { data: livePrice, isLoading: livePriceLoading } = usePythLivePrice(
    priceMarketData.feedId,
  );

  // Accumulated price history for price chart
  const { data: priceHistoryData, currentPrice: priceChartCurrent } =
    usePythPriceHistory(priceMarketData.feedId);

  // Probability chart data
  const fallbackPrice = (() => {
    if (!lastPriceTick || !tickSize) return undefined;
    const tickSizeNum = parseFloat(tickSize);
    const tickNum = parseFloat(lastPriceTick);

    if (tickSizeNum === 0 || tickNum === 0) return undefined;

    return (tickNum * tickSizeNum) / 1e18;
  })();

  const { data: chartResult, isLoading: chartLoading } = usePriceChartData(
    marketId,
    tickSize,
    timeframe,
    fallbackPrice,
  );

  // For deferred markets pending resolution, the on-chain strikePrice is 0 and
  // we use the SDK-projected open price (same selection rule the contract will
  // apply at resolution). Once resolved, the on-chain value backfills.
  const isStrikePending =
    !priceMarketData.resolved && priceMarketData.strikePrice === BigInt(0);
  const effectiveStrike =
    isStrikePending && projectedOpenPrice
      ? projectedOpenPrice.price
      : priceMarketData.strikePrice;
  const strikeNum =
    Number(effectiveStrike) * Math.pow(10, priceMarketData.priceExpo);
  // While the strike is pending and we don't even have a projection yet (the
  // open window for a scheduled market hasn't opened), don't show a direction.
  const strikeKnown = !isStrikePending || !!projectedOpenPrice;
  const priceDirection: "up" | "down" | null =
    livePrice && strikeKnown
      ? livePrice.price >= strikeNum
        ? "up"
        : "down"
      : null;

  const hasNoProbabilityData =
    !chartResult ||
    (chartResult.data.length === 0 && fallbackPrice === undefined);

  const isResolved = priceMarketData.resolved;
  const effectiveTab = isResolved ? "probability" : activeTab;
  const finalPriceNum = isResolved
    ? Number(priceMarketData.finalPrice) *
      Math.pow(10, priceMarketData.priceExpo)
    : undefined;

  return (
    <Card>
      {/* Top row: Price info + countdown */}
      <CardHeader className="flex-col gap-3 pb-0">
        <div className="flex items-start justify-between w-full">
          <PriceInfoHeader
            currentPrice={livePrice?.price}
            finalPrice={finalPriceNum}
            isLoading={livePriceLoading}
            priceDirection={priceDirection}
            resolved={isResolved}
            strikeKnown={strikeKnown}
            strikePending={
              isStrikePending && projectedOpenPrice
                ? !projectedOpenPrice.canonical
                : isStrikePending
            }
            strikePriceNum={strikeNum}
          />
          {!isResolved && (
            <CountdownTimer closeTime={priceMarketData.closeTime} />
          )}
        </div>

        {/* Subheader: Timeframe buttons + tab switcher */}
        <div className="flex items-center justify-between w-full">
          {/* Timeframe selector — only for probability tab */}
          <div className="flex items-center gap-1">
            {effectiveTab === "probability" ? (
              TIMEFRAMES.map((tf) => (
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
              ))
            ) : (
              <span className="text-xs text-default-400">
                Live &mdash; prices since page load
              </span>
            )}
          </div>

          {!isResolved && (
            <ChartTabSwitcher
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          )}
        </div>
      </CardHeader>

      <CardBody className="pt-2">
        {effectiveTab === "probability" ? (
          // Probability chart (existing behavior)
          chartLoading ? (
            <PriceChartSkeleton />
          ) : hasNoProbabilityData ? (
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
          )
        ) : // Asset price chart
        priceHistoryData.length < 2 ? (
          <div className="flex flex-col items-center justify-center h-[300px] gap-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className="text-sm text-default-400">
                Collecting live price data
                {priceChartCurrent
                  ? ` — ${feedSymbol ?? ""} $${priceChartCurrent.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : "..."}
              </span>
            </div>
            <span className="text-xs text-default-300">
              The chart will appear as more data points arrive
            </span>
          </div>
        ) : (
          <AssetPriceChart
            currentPrice={priceChartCurrent}
            data={priceHistoryData}
            feedSymbol={feedSymbol}
            height={300}
            strikePrice={strikeNum}
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
