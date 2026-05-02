"use client";

import { use, useState, useEffect } from "react";

import { useMarketGroupDetail } from "@/features/market-groups/hooks/useMarketGroupDetail";
import { useGroupMarkets } from "@/features/market-groups/hooks/useGroupMarkets";
import { MarketGroupDetailHeader } from "@/features/market-groups/components/MarketGroupDetailHeader";
import { GroupOutcomesList } from "@/features/market-groups/components/GroupOutcomesList";
import { MarketGroupDetailSkeleton } from "@/features/market-groups/components/MarketGroupDetailSkeleton";
import { MarketGroupManagementPanel } from "@/features/market-groups/components/MarketGroupManagementPanel";
import { OrderbookPanel } from "@/features/orderbook/components/OrderbookPanel";
import { UnifiedTradingPanel } from "@/features/trading/components/UnifiedTradingPanel";
import { UserPositionsPanel } from "@/features/trading/components/UserPositionsPanel";
import { UserOrdersPanel } from "@/features/trading/components/UserOrdersPanel";
import { MatchOrdersButton } from "@/features/trading/components/MatchOrdersButton";
import { ResolutionPanel } from "@/features/resolution/components/ResolutionPanel";
import { ResolvedOutcomeCard } from "@/features/resolution/components/ResolvedOutcomeCard";
import { RedeemPanel } from "@/features/resolution/components/RedeemPanel";
import { RecentTradesPanel } from "@/features/market-detail/components/RecentTradesPanel";
import { MarketDescription } from "@/features/market-detail/components/MarketDescription";
import { TopHoldersPanel } from "@/features/market-holders";
import { PriceChartPanel } from "@/features/price-chart";

export default function MarketGroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const {
    data: group,
    isLoading: groupLoading,
    error,
  } = useMarketGroupDetail(id);
  const { data: markets, isLoading: marketsLoading } = useGroupMarkets(id);
  const [selectedMarketId, setSelectedMarketId] = useState<string | null>(null);

  // Auto-select first active (non-placeholder) market when data loads
  useEffect(() => {
    if (markets && markets.length > 0 && !selectedMarketId) {
      const firstActive = markets.find(
        (m) => !m.isPlaceholder && m.status === "Active",
      );

      if (firstActive) {
        setSelectedMarketId(firstActive.marketId);
      } else {
        setSelectedMarketId(markets[0].marketId);
      }
    }
  }, [markets, selectedMarketId]);

  if (groupLoading || marketsLoading) {
    return <MarketGroupDetailSkeleton />;
  }

  if (error || !group) {
    return (
      <section className="flex flex-col gap-6 pt-4 pb-8 md:pt-6 md:pb-10">
        <div className="text-center py-12">
          <p className="text-default-500">
            {error ? "Failed to load market group" : "Market group not found"}
          </p>
        </div>
      </section>
    );
  }

  const selectedMarket = markets?.find((m) => m.marketId === selectedMarketId);

  return (
    <section className="flex flex-col gap-6 pt-4 pb-8 md:pt-6 md:pb-10">
      <MarketGroupDetailHeader
        group={group}
        selectedMarketId={selectedMarketId}
      />

      <div className="grid grid-cols-1 md:grid-cols-[1fr_338px] gap-4 items-start">
        {/* Left column */}
        <div className="flex flex-col gap-4">
          <GroupOutcomesList
            markets={markets || []}
            selectedMarketId={selectedMarketId}
            onSelectMarket={setSelectedMarketId}
          />

          {group.status !== "Draft" && selectedMarket && (
            <>
              <PriceChartPanel
                lastPriceTick={selectedMarket.lastPriceTick_0}
                marketId={selectedMarket.marketId}
                outcomes={selectedMarket.outcomes}
                tickSize={selectedMarket.tickSize}
              />
              <OrderbookPanel
                marketId={selectedMarket.marketId}
                outcomes={selectedMarket.outcomes}
                tickSize={selectedMarket.tickSize}
              />
              <MatchOrdersButton
                marketId={selectedMarket.marketId}
                tickSize={selectedMarket.tickSize}
              />
              <MarketDescription description={selectedMarket.description} />
              <UserPositionsPanel
                marketId={selectedMarket.marketId}
                noPrice={selectedMarket.noPrice}
                outcomes={selectedMarket.outcomes}
                yesPrice={selectedMarket.yesPrice}
              />
              <UserOrdersPanel
                isResolved={selectedMarket.status === "Resolved"}
                marketId={selectedMarket.marketId}
                outcomes={selectedMarket.outcomes}
                tickSize={selectedMarket.tickSize}
              />
              <RecentTradesPanel
                marketId={selectedMarket.marketId}
                outcomes={selectedMarket.outcomes}
                tickSize={selectedMarket.tickSize}
              />
              <TopHoldersPanel
                marketId={selectedMarket.marketId}
                outcomes={selectedMarket.outcomes}
              />
            </>
          )}
        </div>

        {/* Right column (sticky) */}
        <div className="flex flex-col gap-4 md:sticky md:top-4">
          {group.status !== "Draft" && selectedMarket && (
            <>
              {selectedMarket.status === "Resolved" ? (
                <ResolvedOutcomeCard
                  outcomes={selectedMarket.outcomes}
                  resolvedOutcome={selectedMarket.resolvedOutcome}
                />
              ) : (
                <UnifiedTradingPanel
                  marketId={selectedMarket.marketId}
                  noPrice={selectedMarket.noPrice}
                  outcomes={selectedMarket.outcomes}
                  tickSize={selectedMarket.tickSize}
                  yesPrice={selectedMarket.yesPrice}
                />
              )}
              {selectedMarket.status === "Resolved" ? (
                <RedeemPanel
                  standalone
                  marketId={selectedMarket.marketId}
                  outcomes={selectedMarket.outcomes}
                />
              ) : (
                <ResolutionPanel
                  marketId={selectedMarket.marketId}
                  outcomes={selectedMarket.outcomes}
                />
              )}
            </>
          )}
          <MarketGroupManagementPanel group={group} groupId={id} />
        </div>
      </div>
    </section>
  );
}
