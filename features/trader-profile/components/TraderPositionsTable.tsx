"use client";

import NextLink from "next/link";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Skeleton } from "@heroui/skeleton";
import { parseAncillaryData, getOutcomePrice } from "@oddmaki-protocol/sdk";

interface TraderPositionsTableProps {
  positions: any[];
  isLoading: boolean;
}

export function TraderPositionsTable({
  positions,
  isLoading,
}: TraderPositionsTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="px-4 pt-4 pb-0">
          <h2 className="text-lg font-semibold">Positions</h2>
        </CardHeader>
        <CardBody className="p-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded mb-2" />
          ))}
        </CardBody>
      </Card>
    );
  }

  if (positions.length === 0) {
    return (
      <Card>
        <CardHeader className="px-4 pt-4 pb-0">
          <h2 className="text-lg font-semibold">Active Positions</h2>
        </CardHeader>
        <CardBody className="p-4">
          <p className="text-sm text-default-500">No active positions</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="px-4 pt-4 pb-0">
        <h2 className="text-lg font-semibold">
          Active Positions ({positions.length})
        </h2>
      </CardHeader>
      <CardBody className="p-4">
        <div className="overflow-x-auto hidden sm:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-default-500 border-b border-default-200">
                <th className="pb-2 font-medium">Market</th>
                <th className="pb-2 font-medium text-right">Avg</th>
                <th className="pb-2 font-medium text-right">Current</th>
                <th className="pb-2 font-medium text-right">Value</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((pos: any) => {
                const market = pos.market;
                const decimals = market.collateralDecimals || 6;
                const outcomeIndex = parseInt(pos.outcome);
                const outcomeName =
                  market.outcomes?.[outcomeIndex] ||
                  (outcomeIndex === 0 ? "Yes" : "No");

                // Quantity in human-readable units
                const qty = parseFloat(pos.quantity) / Math.pow(10, decimals);

                // Average entry price: avgEntryPrice = costPerToken * 1e18
                const avgPriceRaw = parseFloat(pos.avgEntryPrice || "0") / 1e18;
                const avgPercent = (avgPriceRaw * 100).toFixed(1);

                // Current price (handles complement + resolved markets)
                const currentPercent = getOutcomePrice(market, outcomeIndex);

                // Position value = quantity * currentPrice (as decimal)
                const currentPrice = currentPercent / 100;
                const value = qty * currentPrice;

                // Unrealized P&L
                const costBasis =
                  parseFloat(pos.totalCostBasis) / Math.pow(10, decimals);
                const unrealizedPnL = value - costBasis;
                const pnlColor =
                  unrealizedPnL >= 0 ? "text-success" : "text-danger";
                const pnlPercent =
                  costBasis > 0
                    ? ((unrealizedPnL / costBasis) * 100).toFixed(1)
                    : "0.0";

                return (
                  <tr
                    key={pos.id}
                    className="border-b border-default-100 last:border-0"
                  >
                    <td className="py-3">
                      <NextLink
                        className="hover:text-primary transition-colors"
                        href={`/market/${market.marketId}`}
                      >
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-medium line-clamp-1">
                            {parseAncillaryData(market.question).title}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <Chip
                              color={outcomeIndex === 0 ? "success" : "danger"}
                              size="sm"
                              variant="flat"
                            >
                              {outcomeName} {avgPercent}&cent;
                            </Chip>
                            <span className="text-xs text-default-500">
                              {qty.toFixed(1)} shares
                            </span>
                          </div>
                        </div>
                      </NextLink>
                    </td>
                    <td className="py-3 text-right">{avgPercent}&cent;</td>
                    <td className="py-3 text-right">
                      {currentPercent.toFixed(1)}&cent;
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex flex-col items-end">
                        <span>${value.toFixed(2)}</span>
                        <span className={`text-xs ${pnlColor}`}>
                          {unrealizedPnL >= 0 ? "+" : ""}
                          {pnlPercent}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile: card list */}
        <div className="sm:hidden flex flex-col gap-3">
          {positions.map((pos: any) => {
            const market = pos.market;
            const decimals = market.collateralDecimals || 6;
            const outcomeIndex = parseInt(pos.outcome);
            const outcomeName =
              market.outcomes?.[outcomeIndex] ||
              (outcomeIndex === 0 ? "Yes" : "No");

            const qty = parseFloat(pos.quantity) / Math.pow(10, decimals);
            const avgPriceRaw = parseFloat(pos.avgEntryPrice || "0") / 1e18;
            const avgPercent = (avgPriceRaw * 100).toFixed(1);
            const currentPercent = getOutcomePrice(market, outcomeIndex);
            const currentPrice = currentPercent / 100;
            const value = qty * currentPrice;
            const costBasis =
              parseFloat(pos.totalCostBasis) / Math.pow(10, decimals);
            const unrealizedPnL = value - costBasis;
            const pnlColor =
              unrealizedPnL >= 0 ? "text-success" : "text-danger";
            const pnlPercent =
              costBasis > 0
                ? ((unrealizedPnL / costBasis) * 100).toFixed(1)
                : "0.0";

            return (
              <NextLink
                key={pos.id}
                className="flex flex-col gap-2 p-3 rounded-lg border border-default-100 hover:border-default-200 hover:bg-default-50 transition-colors"
                href={`/market/${market.marketId}`}
              >
                <span className="text-sm font-medium line-clamp-2">
                  {parseAncillaryData(market.question).title}
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  <Chip
                    color={outcomeIndex === 0 ? "success" : "danger"}
                    size="sm"
                    variant="flat"
                  >
                    {outcomeName} {avgPercent}&cent;
                  </Chip>
                  <span className="text-xs text-default-500">
                    {qty.toFixed(1)} shares
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-default-100">
                  <span className="text-xs text-default-500">
                    Now {currentPercent.toFixed(1)}&cent;
                  </span>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold">${value.toFixed(2)}</span>
                    <span className={`text-xs ${pnlColor}`}>
                      {unrealizedPnL >= 0 ? "+" : ""}
                      {pnlPercent}%
                    </span>
                  </div>
                </div>
              </NextLink>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
