"use client";

import NextLink from "next/link";
import { Card, CardBody } from "@heroui/card";
import { Skeleton } from "@heroui/skeleton";

import {
  AddressAvatar,
  generatePseudonym,
  shortenAddress,
} from "@/lib/identity";
import { formatVolume } from "@/features/markets/utils/formatting";

interface LeaderboardTableProps {
  users: any[];
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

export function LeaderboardTable({ users, isLoading }: LeaderboardTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardBody className="p-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded mb-2" />
          ))}
        </CardBody>
      </Card>
    );
  }

  if (users.length === 0) {
    return (
      <Card>
        <CardBody className="p-6 text-center">
          <p className="text-default-500">No trading activity yet</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody className="p-0">
        {/* Desktop: table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-default-500 border-b border-default-200">
                <th className="p-4 font-medium w-12">#</th>
                <th className="p-4 font-medium">Trader</th>
                <th className="p-4 font-medium text-right">Volume</th>
                <th className="p-4 font-medium text-right">Realized P&L</th>
                <th className="p-4 font-medium text-right">Trades</th>
                <th className="p-4 font-medium text-right">Markets</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user: any, index: number) => {
                const pnlValue = parseFloat(user.totalRealizedPnL || "0");
                const pnlColor =
                  pnlValue > 0
                    ? "text-success"
                    : pnlValue < 0
                      ? "text-danger"
                      : "";

                return (
                  <tr
                    key={user.id}
                    className="border-b border-default-100 last:border-0 hover:bg-default-50 transition-colors"
                  >
                    <td className="p-4 text-default-500 font-medium">
                      {index + 1}
                    </td>
                    <td className="p-4">
                      <NextLink
                        className="flex items-center gap-3 hover:text-primary transition-colors"
                        href={`/trader/${user.id}`}
                      >
                        <AddressAvatar address={user.id} size={32} />
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {generatePseudonym(user.id)}
                          </span>
                          <span className="text-xs text-default-400">
                            {shortenAddress(user.id)}
                          </span>
                        </div>
                      </NextLink>
                    </td>
                    <td className="p-4 text-right font-medium">
                      {formatVolume(user.totalVolume || "0")}
                    </td>
                    <td className={`p-4 text-right font-medium ${pnlColor}`}>
                      {formatPnL(user.totalRealizedPnL || "0")}
                    </td>
                    <td className="p-4 text-right text-default-500">
                      {user.totalTradeCount || "0"}
                    </td>
                    <td className="p-4 text-right text-default-500">
                      {user.totalMarketsTraded || "0"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile: card list */}
        <div className="sm:hidden flex flex-col">
          {users.map((user: any, index: number) => {
            const pnlValue = parseFloat(user.totalRealizedPnL || "0");
            const pnlColor =
              pnlValue > 0 ? "text-success" : pnlValue < 0 ? "text-danger" : "";

            return (
              <NextLink
                key={user.id}
                className="flex flex-col gap-2 p-3 border-b border-default-100 last:border-0 hover:bg-default-50 transition-colors"
                href={`/trader/${user.id}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-default-500 font-medium w-6 text-center">
                    {index + 1}
                  </span>
                  <AddressAvatar address={user.id} size={28} />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-medium truncate">
                      {generatePseudonym(user.id)}
                    </span>
                    <span className="text-xs text-default-400 truncate">
                      {shortenAddress(user.id)}
                    </span>
                  </div>
                  <div className={`text-right font-semibold ${pnlColor}`}>
                    {formatPnL(user.totalRealizedPnL || "0")}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-default-500 pl-9">
                  <span>Vol {formatVolume(user.totalVolume || "0")}</span>
                  <span>{user.totalTradeCount || "0"} trades</span>
                  <span>{user.totalMarketsTraded || "0"} markets</span>
                </div>
              </NextLink>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
