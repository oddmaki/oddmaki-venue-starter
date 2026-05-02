"use client";

import { Card, CardBody } from "@heroui/card";
import { Skeleton } from "@heroui/skeleton";

import { formatVolume } from "@/features/markets/utils/formatting";

interface TraderStatsCardsProps {
  user: any | null;
  positionsValue: string;
  isLoading: boolean;
}

function formatPnL(value: string, decimals: number = 6): string {
  const num = parseFloat(value) / Math.pow(10, decimals);
  const sign = num >= 0 ? "+" : "";

  if (Math.abs(num) >= 1_000_000)
    return `${sign}$${(num / 1_000_000).toFixed(2)}M`;
  if (Math.abs(num) >= 1_000) return `${sign}$${(num / 1_000).toFixed(2)}K`;

  return `${sign}$${num.toFixed(2)}`;
}

export function TraderStatsCards({
  user,
  positionsValue,
  isLoading,
}: TraderStatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardBody className="p-4">
              <Skeleton className="h-4 w-20 rounded mb-2" />
              <Skeleton className="h-6 w-16 rounded" />
            </CardBody>
          </Card>
        ))}
      </div>
    );
  }

  if (!user) return null;

  const pnlValue = parseFloat(user.totalRealizedPnL || "0");
  const pnlColor = pnlValue >= 0 ? "text-success" : "text-danger";

  const stats = [
    {
      label: "Positions Value",
      value: formatVolume(positionsValue),
    },
    {
      label: "Realized P&L",
      value: formatPnL(user.totalRealizedPnL || "0"),
      className: pnlColor,
    },
    {
      label: "Volume",
      value: formatVolume(user.totalVolume || "0"),
    },
    {
      label: "Markets Traded",
      value: user.totalMarketsTraded || "0",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardBody className="p-4">
            <p className="text-xs text-default-500 mb-1">{stat.label}</p>
            <p className={`text-lg font-semibold ${stat.className || ""}`}>
              {stat.value}
            </p>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
