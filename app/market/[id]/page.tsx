'use client';

import { use } from 'react';
import { Accordion, AccordionItem } from '@heroui/accordion';
import { useMarketDetail } from '@/features/market-detail/hooks/useMarketDetail';
import { MarketDetailHeader } from '@/features/market-detail/components/MarketDetailHeader';
import { MarketDetailSkeleton } from '@/features/market-detail/components/MarketDetailSkeleton';
import { MarketDescription } from '@/features/market-detail/components/MarketDescription';
import { RecentTradesPanel } from '@/features/market-detail/components/RecentTradesPanel';
import { OrderbookPanel } from '@/features/orderbook/components/OrderbookPanel';
import { UnifiedTradingPanel } from '@/features/trading/components/UnifiedTradingPanel';
import { UserPositionsPanel } from '@/features/trading/components/UserPositionsPanel';
import { UserOrdersPanel } from '@/features/trading/components/UserOrdersPanel';
import { MatchOrdersButton } from '@/features/trading/components/MatchOrdersButton';
import { ResolutionPanel } from '@/features/resolution/components/ResolutionPanel';
import { ResolvedOutcomeCard } from '@/features/resolution/components/ResolvedOutcomeCard';
import { RedeemPanel } from '@/features/resolution/components/RedeemPanel';
import { PriceChartPanel } from '@/features/price-chart';
import { TopHoldersPanel } from '@/features/market-holders';
import { usePriceMarketData, PriceMarketInfo, PriceMarketResolutionPanel, PriceMarketChartSection } from '@/features/price-market';

export default function MarketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: market, isLoading, error } = useMarketDetail(id);
  const { data: priceMarket } = usePriceMarketData(BigInt(id));

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
            {error ? 'Failed to load market' : 'Market not found'}
          </p>
        </div>
      </section>
    );
  }

  const isPriceMarket = priceMarket?.isPriceMarket && priceMarket.data;
  const isResolved = market.status === 'Resolved';

  return (
    <section className="flex flex-col gap-6 pt-4 pb-8 md:pt-6 md:pb-10">
      {/* Header: title, status, prices, stats */}
      <MarketDetailHeader market={market} />

      {/* Two-column layout: left (~938px) | right (338px) */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_338px] gap-4 items-start">
        {/* Left column */}
        <div className="flex flex-col gap-4">
          {isPriceMarket ? (
            <PriceMarketChartSection
              marketId={market.marketId}
              tickSize={market.tickSize}
              outcomes={market.outcomes}
              lastPriceTick={market.lastPriceTick_0}
              priceMarketData={priceMarket!.data!}
            />
          ) : (
            <PriceChartPanel
              marketId={market.marketId}
              tickSize={market.tickSize}
              outcomes={market.outcomes}
              lastPriceTick={market.lastPriceTick_0}
            />
          )}
          <OrderbookPanel
            marketId={market.marketId}
            tickSize={market.tickSize}
            outcomes={market.outcomes}
          />
          <MatchOrdersButton marketId={market.marketId} tickSize={market.tickSize} />

          <MarketDescription description={market.description} />
          <UserPositionsPanel
            marketId={market.marketId}
            outcomes={market.outcomes}
            yesPrice={market.yesPrice}
            noPrice={market.noPrice}
          />
          <UserOrdersPanel
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
        <div className="flex flex-col gap-4">
          {isResolved ? (
            <ResolvedOutcomeCard
              marketId={market.marketId}
              outcomes={market.outcomes}
            />
          ) : (
            <UnifiedTradingPanel
              marketId={market.marketId}
              outcomes={market.outcomes}
              tickSize={market.tickSize}
            />
          )}
          {/* Price market info (always shown for price markets) */}
          {isPriceMarket && (
            <PriceMarketInfo data={priceMarket.data!} outcomes={market.outcomes} />
          )}

          {/* Resolution section */}
          {isResolved ? (
            <RedeemPanel
              marketId={market.marketId}
              outcomes={market.outcomes}
              standalone
            />
          ) : isPriceMarket ? (
            <>
              <PriceMarketResolutionPanel
                marketId={BigInt(market.marketId)}
                canResolve={priceMarket.canResolve}
                data={priceMarket.data!}
              />
              <Accordion variant="bordered" className="px-0">
                <AccordionItem
                  key="uma-fallback"
                  aria-label="Oracle Resolution (UMA)"
                  classNames={{
                    base: "px-4",
                  }}
                  title={
                    <span className="text-base font-semibold">Oracle Resolution (UMA)</span>
                  }
                  subtitle={
                    <span className="text-xs text-default-400">Fallback — requires posting a bond</span>
                  }
                >
                  <ResolutionPanel
                    marketId={market.marketId}
                    outcomes={market.outcomes}
                    description="Resolve via UMA's optimistic oracle. Requires posting a collateral bond and a challenge period."
                    bare
                  />
                </AccordionItem>
              </Accordion>
            </>
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
