'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useUnifiedFeed } from '../hooks/useUnifiedFeed';
import { useFilterToggle } from '../hooks/useFilterToggle';
import { MarketCard } from './MarketCard';
import { MarketSkeleton } from './MarketSkeleton';
import { EmptyState } from './EmptyState';
import { MarketGroupCard } from '@/features/market-groups/components/MarketGroupCard';
import { MarketGroupSkeleton } from '@/features/market-groups/components/MarketGroupSkeleton';
import { MarketStatusFilter } from './MarketStatusFilter';
import type { StatusFilter } from './MarketStatusFilter';
import { CATEGORIES } from '@/config/tags.config';
import type { UnifiedFeedItem } from '../types';

export function MarketGrid() {
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get('category');
  const sortParam = searchParams.get('sort');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('Active');
  const { showFilters } = useFilterToggle();

  // Categories always use volume sort; only 'new' sort mode uses created
  const sortBy = sortParam === 'new' && !selectedCategory ? 'created' : 'volume';

  const { data: items, isLoading, error } = useUnifiedFeed(sortBy);

  const filteredItems = useMemo(() => {
    if (!items) return [];

    let result = items;

    // Filter by category
    if (selectedCategory) {
      const category = CATEGORIES.find((c) => c.id === selectedCategory);
      if (category && category.matchTags.length > 0) {
        result = result.filter((item: UnifiedFeedItem) => {
          const tags =
            item.type === 'standalone' ? item.data.tags : item.data.tags;
          return tags?.some((tag: string) => category.matchTags.includes(tag));
        });
      }
    }

    // Filter by status
    result = result.filter((item: UnifiedFeedItem) => {
      const status =
        item.type === 'standalone' ? item.data.status : item.data.status;
      return status === statusFilter;
    });

    return result;
  }, [items, selectedCategory, statusFilter]);

  if (error) {
    return (
      <EmptyState
        title="Error loading markets"
        description="There was an error loading markets. Please try again later."
      />
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <MarketSkeleton key={`m-${i}`} />
        ))}
        {Array.from({ length: 2 }).map((_, i) => (
          <MarketGroupSkeleton key={`g-${i}`} />
        ))}
      </div>
    );
  }

  if (!items || items.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filter controls — toggled via filter icon in category bar */}
      {showFilters && (
        <div className="flex items-center gap-2">
          <MarketStatusFilter value={statusFilter} onChange={setStatusFilter} />
        </div>
      )}

      {filteredItems.length === 0 ? (
        <EmptyState
          title="No markets found"
          description="No markets match the current filters. Try adjusting your selection."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map((item: UnifiedFeedItem) =>
            item.type === 'standalone' ? (
              <MarketCard key={`m-${item.data.marketId}`} market={item.data} />
            ) : (
              <MarketGroupCard
                key={`g-${item.data.groupId}`}
                group={item.data}
              />
            ),
          )}
        </div>
      )}
    </div>
  );
}
