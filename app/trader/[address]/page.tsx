"use client";

import { use, useState } from "react";
import { Tabs, Tab } from "@heroui/tabs";
import { getOutcomePrice } from "@oddmaki-protocol/sdk";

import {
  useTraderProfile,
  useTraderPositions,
  useTraderClosedPositions,
  useTraderTrades,
  TraderProfileHeader,
  TraderStatsCards,
  TraderPositionsTable,
  TraderClosedPositionsTable,
  TraderActivityFeed,
} from "@/features/trader-profile";

export default function TraderProfilePage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = use(params);
  const addr = address.toLowerCase();
  const [positionTab, setPositionTab] = useState<string>("active");

  const { data: user, isLoading: profileLoading } = useTraderProfile(addr);
  const { data: positions = [], isLoading: positionsLoading } =
    useTraderPositions(addr);
  const { data: closedPositions = [], isLoading: closedLoading } =
    useTraderClosedPositions(addr);
  const { data: trades = [], isLoading: tradesLoading } = useTraderTrades(addr);

  // Calculate current market value of open positions
  const positionsValue = positions.reduce((sum: number, pos: any) => {
    const market = pos.market;
    const decimals = market.collateralDecimals || 6;
    const outcomeIndex = parseInt(pos.outcome);
    const currentPercent = getOutcomePrice(market, outcomeIndex);
    const qty = parseFloat(pos.quantity) / Math.pow(10, decimals);

    return sum + qty * (currentPercent / 100);
  }, 0);
  const positionsValueRaw = Math.round(positionsValue * 1e6).toString();

  return (
    <section className="flex flex-col gap-6 pt-4 pb-8 md:pt-6 md:pb-10 max-w-4xl mx-auto w-full">
      <TraderProfileHeader
        address={addr}
        isLoading={profileLoading}
        user={user ?? null}
      />

      <TraderStatsCards
        isLoading={profileLoading}
        positionsValue={positionsValueRaw}
        user={user ?? null}
      />

      <Tabs
        aria-label="Trader sections"
        classNames={{ tabList: "gap-6" }}
        variant="underlined"
      >
        <Tab key="positions" title={`Positions (${positions.length})`}>
          <div className="flex flex-col gap-4">
            <Tabs
              aria-label="Position status"
              classNames={{ tabList: "gap-2" }}
              selectedKey={positionTab}
              size="sm"
              variant="light"
              onSelectionChange={(key) => setPositionTab(key as string)}
            >
              <Tab key="active" title="Active" />
              <Tab key="closed" title="Closed" />
            </Tabs>

            {positionTab === "active" ? (
              <TraderPositionsTable
                isLoading={positionsLoading}
                positions={positions}
              />
            ) : (
              <TraderClosedPositionsTable
                isLoading={closedLoading}
                positions={closedPositions}
              />
            )}
          </div>
        </Tab>
        <Tab key="activity" title="Activity">
          <TraderActivityFeed isLoading={tradesLoading} trades={trades} />
        </Tab>
      </Tabs>
    </section>
  );
}
