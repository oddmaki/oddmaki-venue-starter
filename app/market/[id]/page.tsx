"use client";

import { use } from "react";

import { useMarketDetail } from "@/features/market-detail/hooks/useMarketDetail";
import { MarketDetailHeader } from "@/features/market-detail/components/MarketDetailHeader";
import { MarketDetailSkeleton } from "@/features/market-detail/components/MarketDetailSkeleton";
import { MarketDescription } from "@/features/market-detail/components/MarketDescription";
import { RecentTradesPanel } from "@/features/market-detail/components/RecentTradesPanel";
import { OrderbookPanel } from "@/features/orderbook/components/OrderbookPanel";
import { UnifiedTradingPanel } from "@/features/trading/components/UnifiedTradingPanel";
import { UserPositionsPanel } from "@/features/trading/components/UserPositionsPanel";
import { UserOrdersPanel } from "@/features/trading/components/UserOrdersPanel";
import { MatchOrdersButton } from "@/features/trading/components/MatchOrdersButton";
import { ResolutionPanel } from "@/features/resolution/components/ResolutionPanel";
import { ResolvedOutcomeCard } from "@/features/resolution/components/ResolvedOutcomeCard";
import { RedeemPanel } from "@/features/resolution/components/RedeemPanel";
import { PriceChartPanel } from "@/features/price-chart";
import { TopHoldersPanel } from "@/features/market-holders";
import {
  usePriceMarketData,
  PriceMarketInfo,
  PriceMarketResolutionPanel,
  PriceMarketChartSection,
} from "@/features/price-market";
import {
  TimeWindowStrip,
  usePriceMarketSeries,
  extractSeriesKey,
} from "@/features/price-market-series";

export default function MarketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: market, isLoading, error } = useMarketDetail(id);
  const { data: priceMarket } = usePriceMarketData(BigInt(id));
  const seriesKey = extractSeriesKey(market?.tags);
  const { data: series } = usePriceMarketSeries(seriesKey);

  if (isLoading) {
    return (
      <section className="flex flex-col gap-6 pt-4 pb-8 md:pt-6 md:pb-10">
        <MarketDetailSkeleton />
      </section>
    );
  }

  if (error || !market) {
    return (
      <section className="flex flex-col gap-6 pt-4 pb-8 md:pt-6 md:pb-10">
        <div className="text-center py-12">
          <p className="text-default-500">
            {error ? "Failed to load market" : "Market not found"}
          </p>
        </div>
      </section>
    );
  }

  const isPriceMarket = priceMarket?.isPriceMarket && priceMarket.data;
  const isResolved = market.status === "Resolved";
  const winningOutcome =
    market.resolvedOutcome != null
      ? market.resolvedOutcome === 0
        ? "YES"
        : "NO"
      : undefined;

  return (
    <section className="flex flex-col gap-6 pt-4 pb-8 md:pt-6 md:pb-10">
      {/* Header: title, status, prices, stats */}
      <MarketDetailHeader market={market} />

      {/* Two-column layout: left (~938px) | right (338px). On mobile, trading panel appears first. */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_338px] gap-4 items-start">
        {/* Left column */}
        <div className="flex flex-col gap-4 order-2 md:order-1">
          {isPriceMarket ? (
            <PriceMarketChartSection
              lastPriceTick={market.lastPriceTick_0}
              marketId={market.marketId}
              outcomes={market.outcomes}
              priceMarketData={priceMarket!.data!}
              tickSize={market.tickSize}
            />
          ) : (
            <PriceChartPanel
              lastPriceTick={market.lastPriceTick_0}
              marketId={market.marketId}
              outcomes={market.outcomes}
              tickSize={market.tickSize}
            />
          )}
          {series && (
            <TimeWindowStrip
              selectedMarketId={market.marketId}
              series={series}
            />
          )}
          <OrderbookPanel
            marketId={market.marketId}
            outcomes={market.outcomes}
            tickSize={market.tickSize}
          />
          <MatchOrdersButton
            marketId={market.marketId}
            tickSize={market.tickSize}
          />

          <MarketDescription description={market.description} />
          <UserPositionsPanel
            marketId={market.marketId}
            noPrice={market.noPrice}
            outcomes={market.outcomes}
            yesPrice={market.yesPrice}
          />
          <UserOrdersPanel
            isResolved={isResolved}
            marketId={market.marketId}
            outcomes={market.outcomes}
            tickSize={market.tickSize}
          />
          <RecentTradesPanel
            marketId={market.marketId}
            outcomes={market.outcomes}
            tickSize={market.tickSize}
          />
          <TopHoldersPanel
            marketId={market.marketId}
            outcomes={market.outcomes}
          />
        </div>

        {/* Right column (sticky trading panel) */}
        <div className="flex flex-col gap-4 order-1 md:order-2">
          {isResolved ? (
            <ResolvedOutcomeCard
              outcomes={market.outcomes}
              resolvedOutcome={market.resolvedOutcome}
            />
          ) : (
            <UnifiedTradingPanel
              marketId={market.marketId}
              noPrice={market.noPrice}
              outcomes={market.outcomes}
              tickSize={market.tickSize}
              yesPrice={market.yesPrice}
            />
          )}
          {/* Price market info (always shown for price markets) */}
          {isPriceMarket && (
            <PriceMarketInfo
              data={priceMarket.data!}
              outcomes={market.outcomes}
            />
          )}

          {/* Resolution section */}
          {isResolved ? (
            <RedeemPanel
              standalone
              marketId={market.marketId}
              outcomes={market.outcomes}
              winningOutcome={winningOutcome}
            />
          ) : isPriceMarket ? (
            <PriceMarketResolutionPanel
              canResolve={priceMarket.canResolve}
              data={priceMarket.data!}
              marketId={BigInt(market.marketId)}
            />
          ) : (
            <ResolutionPanel
              marketId={market.marketId}
              outcomes={market.outcomes}
            />
          )}
        </div>
      </div>
    </section>
  );
}
