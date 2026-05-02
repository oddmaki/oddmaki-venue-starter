"use client";

import type { GroupMarketDetail } from "../hooks/useGroupMarkets";

import { Card, CardHeader, CardBody } from "@heroui/card";

interface GroupOutcomesListProps {
  markets: GroupMarketDetail[];
  selectedMarketId: string | null;
  onSelectMarket: (marketId: string) => void;
}

export function GroupOutcomesList({
  markets,
  selectedMarketId,
  onSelectMarket,
}: GroupOutcomesListProps) {
  const activeMarkets = markets.filter((m) => !m.isPlaceholder);
  const placeholders = markets.filter((m) => m.isPlaceholder);

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">Markets</h2>
      </CardHeader>
      <CardBody className="gap-0 p-0">
        {activeMarkets.map((market) => {
          const isSelected = market.marketId === selectedMarketId;
          const pct = Math.round(market.yesPrice);

          return (
            <button
              key={market.marketId}
              className={`w-full text-left px-4 py-3 flex items-center justify-between gap-3 transition-colors border-b border-default-100 last:border-b-0 hover:bg-default-100 ${
                isSelected ? "bg-default-100" : ""
              }`}
              type="button"
              onClick={() => onSelectMarket(market.marketId)}
            >
              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <span className="text-sm font-medium truncate">
                  {market.name}
                </span>
                <span className="text-xs text-default-400">
                  {market.volumeFormatted} Vol.
                </span>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <span
                  className={`text-lg font-bold ${
                    pct >= 50 ? "text-primary" : "text-default-500"
                  }`}
                >
                  {pct}%
                </span>
                <div className="flex gap-1">
                  <span className="text-xs rounded bg-primary/10 text-primary px-2 py-1 font-medium">
                    Yes {pct}c
                  </span>
                  <span className="text-xs rounded bg-secondary/10 text-secondary px-2 py-1 font-medium">
                    No {100 - pct}c
                  </span>
                </div>
              </div>
            </button>
          );
        })}

        {placeholders.length > 0 && (
          <div className="px-4 py-2 text-xs text-default-400">
            {placeholders.length} placeholder
            {placeholders.length > 1 ? "s" : ""} pending activation
          </div>
        )}
      </CardBody>
    </Card>
  );
}
