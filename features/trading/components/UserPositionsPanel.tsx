"use client";

import { Card, CardHeader, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Skeleton } from "@heroui/skeleton";

import { useUserPositions } from "@/features/market-detail/hooks/useUserPositions";
import { RefreshButton } from "@/lib/oddmaki/RefreshButton";

interface UserPositionsPanelProps {
  marketId: string;
  outcomes: string[];
  yesPrice: number;
  noPrice: number;
}

function formatBalance(balance: string): string {
  const num = parseFloat(balance);

  if (isNaN(num) || num === 0) return "0";
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  if (num < 0.01) return num.toFixed(4);

  return num.toFixed(2);
}

function formatValue(balance: string, price: number): string {
  const bal = parseFloat(balance);

  if (isNaN(bal) || bal === 0 || price === 0) return "$0.00";
  const value = bal * (price / 100); // price is percentage, convert to decimal

  return `$${value.toFixed(2)}`;
}

export function UserPositionsPanel({
  marketId,
  outcomes,
  yesPrice,
  noPrice,
}: UserPositionsPanelProps) {
  const {
    data: positions,
    isLoading,
    isFetching,
    refetch,
  } = useUserPositions(marketId);

  const yesLabel = outcomes[0] || "Yes";
  const noLabel = outcomes[1] || "No";

  const yesBalance = positions?.YES || "0";
  const noBalance = positions?.NO || "0";
  const hasPositions = parseFloat(yesBalance) > 0 || parseFloat(noBalance) > 0;

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Your Positions</h2>
        <RefreshButton isFetching={isFetching} onRefresh={() => refetch()} />
      </CardHeader>
      <CardBody>
        {isLoading ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ) : !hasPositions ? (
          <p className="text-sm text-default-400 text-center py-4">
            No positions yet
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {/* YES position */}
            {parseFloat(yesBalance) > 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5">
                <div className="flex items-center gap-2">
                  <Chip color="primary" size="sm" variant="flat">
                    {yesLabel}
                  </Chip>
                  <span className="text-sm font-medium">
                    {formatBalance(yesBalance)}
                  </span>
                </div>
                <span className="text-sm text-default-500">
                  {formatValue(yesBalance, yesPrice)}
                </span>
              </div>
            )}
            {/* NO position */}
            {parseFloat(noBalance) > 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/5">
                <div className="flex items-center gap-2">
                  <Chip color="secondary" size="sm" variant="flat">
                    {noLabel}
                  </Chip>
                  <span className="text-sm font-medium">
                    {formatBalance(noBalance)}
                  </span>
                </div>
                <span className="text-sm text-default-500">
                  {formatValue(noBalance, noPrice)}
                </span>
              </div>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
