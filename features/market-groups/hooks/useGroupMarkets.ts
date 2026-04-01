'use client';

import { useQuery } from '@tanstack/react-query';
import { useOddMakiClient } from '@/lib/oddmaki/hooks';
import { queryKeys } from '@/lib/oddmaki/queryKeys';
import { tickToPercentage, formatVolume } from '@/features/markets/utils/formatting';
import { parseAncillaryData } from '@oddmaki-protocol/sdk';

export interface GroupMarketDetail {
  marketId: string;
  name: string;
  question: string;
  outcomes: string[];
  status: string;
  tickSize: string;
  collateralToken: string;
  conditionId: string;
  yesPrice: number;
  noPrice: number;
  lastPriceTick_0: string;
  description: string;
  totalVolume: string;
  volumeFormatted: string;
  isPlaceholder: boolean;
}

export function useGroupMarkets(groupId: string) {
  const client = useOddMakiClient();

  return useQuery<GroupMarketDetail[]>({
    queryKey: queryKeys.marketGroups.markets(groupId),
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result: any = await client.public.getGroupMarkets({
        groupId: BigInt(groupId),
        first: 100,
      });

      const markets = result.markets || [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return markets.map((m: any): GroupMarketDetail => {
        const yesPrice = tickToPercentage(
          m.lastPriceTick_0 || 0,
          m.tickSize || 0,
        );
        const noPrice =
          yesPrice > 0 ? parseFloat((100 - yesPrice).toFixed(2)) : 0;
        const { description } = parseAncillaryData(m.question || '');

        return {
          marketId: m.marketId,
          name: m.marketGroupItem?.marketName || `Market ${m.marketId}`,
          question: m.question || '',
          outcomes: m.outcomes || ['Yes', 'No'],
          status: m.status,
          tickSize: m.tickSize || '10000000000000000',
          collateralToken: m.collateralToken || '',
          conditionId: m.conditionId || '',
          yesPrice,
          noPrice,
          lastPriceTick_0: m.lastPriceTick_0 || '0',
          description,
          totalVolume: m.totalVolume || '0',
          volumeFormatted: formatVolume(m.totalVolume || '0'),
          isPlaceholder: m.marketGroupItem?.isPlaceholder || false,
        };
      });
    },
    enabled: !!groupId && !!client,
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}
