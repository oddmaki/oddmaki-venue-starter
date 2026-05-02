"use client";

import NextLink from "next/link";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Skeleton } from "@heroui/skeleton";
import { parseAncillaryData } from "@oddmaki-protocol/sdk";

interface TraderClosedPositionsTableProps {
  positions: any[];
  isLoading: boolean;
}

function getResult(
  market: any,
  outcomeIndex: number,
): { label: string; color: "success" | "danger" | "default" } {
  if (market.status === "Resolved" && market.resolvedOutcome != null) {
    return parseInt(market.resolvedOutcome) === outcomeIndex
      ? { label: "Won", color: "success" }
      : { label: "Lost", color: "danger" };
  }

  return { label: "Sold", color: "default" };
}

function formatPnL(value: number): string {
  const sign = value >= 0 ? "+" : "";

  if (Math.abs(value) >= 1_000_000)
    return `${sign}$${(value / 1_000_000).toFixed(2)}M`;
  if (Math.abs(value) >= 1_000) return `${sign}$${(value / 1_000).toFixed(2)}K`;

  return `${sign}$${value.toFixed(2)}`;
}

export function TraderClosedPositionsTable({
  positions,
  isLoading,
}: TraderClosedPositionsTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="px-4 pt-4 pb-0">
          <h2 className="text-lg font-semibold">Closed Positions</h2>
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
          <h2 className="text-lg font-semibold">Closed Positions</h2>
        </CardHeader>
        <CardBody className="p-4">
          <p className="text-sm text-default-500">No closed positions</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="px-4 pt-4 pb-0">
        <h2 className="text-lg font-semibold">
          Closed Positions ({positions.length})
        </h2>
      </CardHeader>
      <CardBody className="p-4">
        <div className="overflow-x-auto hidden sm:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-default-500 border-b border-default-200">
                <th className="pb-2 font-medium">Result</th>
                <th className="pb-2 font-medium">Market</th>
                <th className="pb-2 font-medium text-right">Total Traded</th>
                <th className="pb-2 font-medium text-right">P&L</th>
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

                const result = getResult(market, outcomeIndex);

                // Total traded = totalCollateralIn (what they put in)
                const totalTraded =
                  parseFloat(pos.totalCollateralIn || "0") /
                  Math.pow(10, decimals);

                // Realized P&L
                const realizedPnL =
                  parseFloat(pos.realizedPnL || "0") / Math.pow(10, decimals);
                const pnlColor =
                  realizedPnL >= 0 ? "text-success" : "text-danger";
                const pnlPercent =
                  totalTraded > 0
                    ? ((realizedPnL / totalTraded) * 100).toFixed(0)
                    : "0";

                return (
                  <tr
                    key={pos.id}
                    className="border-b border-default-100 last:border-0"
                  >
                    <td className="py-3">
                      <Chip color={result.color} size="sm" variant="flat">
                        {result.label}
                      </Chip>
                    </td>
                    <td className="py-3">
                      <NextLink
                        className="hover:text-primary transition-colors"
                        href={`/market/${market.marketId}`}
                      >
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-medium line-clamp-1">
                            {parseAncillaryData(market.question).title}
                          </span>
                          <span className="text-xs text-default-500">
                            {outcomeName}
                          </span>
                        </div>
                      </NextLink>
                    </td>
                    <td className="py-3 text-right">
                      ${totalTraded.toFixed(2)}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex flex-col items-end">
                        <span className={pnlColor}>
                          {formatPnL(realizedPnL)}
                        </span>
                        <span className={`text-xs ${pnlColor}`}>
                          ({pnlPercent}%)
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

            const result = getResult(market, outcomeIndex);
            const totalTraded =
              parseFloat(pos.totalCollateralIn || "0") / Math.pow(10, decimals);
            const realizedPnL =
              parseFloat(pos.realizedPnL || "0") / Math.pow(10, decimals);
            const pnlColor = realizedPnL >= 0 ? "text-success" : "text-danger";
            const pnlPercent =
              totalTraded > 0
                ? ((realizedPnL / totalTraded) * 100).toFixed(0)
                : "0";

            return (
              <NextLink
                key={pos.id}
                className="flex flex-col gap-2 p-3 rounded-lg border border-default-100 hover:border-default-200 hover:bg-default-50 transition-colors"
                href={`/market/${market.marketId}`}
              >
                <div className="flex items-center gap-2 justify-between">
                  <Chip color={result.color} size="sm" variant="flat">
                    {result.label}
                  </Chip>
                  <span className={`text-sm font-semibold ${pnlColor}`}>
                    {formatPnL(realizedPnL)} ({pnlPercent}%)
                  </span>
                </div>
                <span className="text-sm font-medium line-clamp-2">
                  {parseAncillaryData(market.question).title}
                </span>
                <div className="flex items-center justify-between text-xs text-default-500">
                  <span>{outcomeName}</span>
                  <span>Traded ${totalTraded.toFixed(2)}</span>
                </div>
              </NextLink>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
