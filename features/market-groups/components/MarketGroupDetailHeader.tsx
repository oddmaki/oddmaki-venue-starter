'use client';

import { Button } from '@heroui/button';
import { Chip } from '@heroui/chip';
import { useRouter } from 'next/navigation';
import { ArrowBackIcon } from '@/components/icons';
import { MarketSettingsButton } from '@/features/market-settings';
import type { FormattedMarketGroup } from '../types';

interface MarketGroupDetailHeaderProps {
  group: FormattedMarketGroup;
  selectedMarketId: string | null;
}

const STATUS_COLOR: Record<
  string,
  'warning' | 'primary' | 'default' | 'danger'
> = {
  Draft: 'warning',
  Active: 'primary',
  Resolved: 'default',
};

export function MarketGroupDetailHeader({
  group,
  selectedMarketId,
}: MarketGroupDetailHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4">
      {/* Title row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-2 flex-1">
          <Button
            isIconOnly
            variant="light"
            size="sm"
            aria-label="Back to markets"
            onPress={() => router.push('/')}
            className="mt-0.5"
          >
            <ArrowBackIcon size={20} />
          </Button>
          <h1 className="text-2xl font-bold">{group.marketQuestion}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Chip
            color={STATUS_COLOR[group.status] || 'default'}
            variant="flat"
            size="sm"
          >
            {group.status}
          </Chip>
          {selectedMarketId && (
            <MarketSettingsButton
              marketId={selectedMarketId}
              marketCreator={group.creator}
            />
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="flex flex-wrap gap-6">
        <div className="flex flex-col">
          <span className="text-xs text-default-400 uppercase">Markets</span>
          <span className="text-lg font-semibold">
            {group.activeMarketCount}
            {group.totalMarkets !== group.activeMarketCount &&
              ` / ${group.totalMarkets}`}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-xs text-default-400 uppercase">Volume</span>
          <span className="text-lg font-semibold">
            {group.volumeFormatted}
          </span>
        </div>

        {group.resolvedMarketId !== '0' && (
          <div className="flex flex-col">
            <span className="text-xs text-default-400 uppercase">Winner</span>
            <span className="text-lg font-semibold text-primary">
              Market #{group.resolvedMarketId}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
