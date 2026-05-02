"use client";

import { useQuery } from "@tanstack/react-query";

import { useOddMakiClient } from "@/lib/oddmaki/hooks";
import { queryKeys } from "@/lib/oddmaki/queryKeys";

export type LeaderboardSortField =
  | "totalVolume"
  | "totalRealizedPnL"
  | "totalTradeCount";

export function useLeaderboard(
  orderBy: LeaderboardSortField = "totalVolume",
  first: number = 50,
) {
  const client = useOddMakiClient();

  return useQuery({
    queryKey: queryKeys.leaderboard.global(orderBy),
    queryFn: async () => {
      const result = await client.public.getLeaderboard({
        orderBy,
        orderDirection: "desc",
        first,
      });

      return result.users ?? [];
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
