"use client";

import type { StatusFilter } from "./MarketStatusFilter";
import type { UnifiedFeedItem } from "../types";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import { useUnifiedFeed } from "../hooks/useUnifiedFeed";
import { useFilterToggle } from "../hooks/useFilterToggle";

import { MarketCard } from "./MarketCard";
import { MarketSkeleton } from "./MarketSkeleton";
import { EmptyState } from "./EmptyState";
import { MarketStatusFilter } from "./MarketStatusFilter";

import { MarketGroupCard } from "@/features/market-groups/components/MarketGroupCard";
import { MarketGroupSkeleton } from "@/features/market-groups/components/MarketGroupSkeleton";
import { PriceSeriesCard } from "@/features/price-market-series";
import { CATEGORIES } from "@/config/tags.config";

export function MarketGrid() {
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get("category");
  const sortParam = searchParams.get("sort");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("Active");
  const { showFilters } = useFilterToggle();

  // Categories always use volume sort; only 'new' sort mode uses created
  const sortBy =
    sortParam === "new" && !selectedCategory ? "created" : "volume";

  const {
    data,
    isLoading,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useUnifiedFeed(sortBy);

  const items = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );

  const filteredItems = useMemo(() => {
    if (items.length === 0) return [];

    let result = items;

    // Filter by category
    if (selectedCategory) {
      const category = CATEGORIES.find((c) => c.id === selectedCategory);

      if (category && category.matchTags.length > 0) {
        result = result.filter((item: UnifiedFeedItem) => {
          return item.data.tags?.some((tag: string) =>
            category.matchTags.includes(tag),
          );
        });
      }
    }

    // Filter by status
    result = result.filter((item: UnifiedFeedItem) => {
      return item.data.status === statusFilter;
    });

    return result;
  }, [items, selectedCategory, statusFilter]);

  if (error) {
    // eslint-disable-next-line no-console
    console.error("[MarketGrid] unified feed error:", error);

    return (
      <EmptyState
        description={
          error instanceof Error
            ? error.message
            : "There was an error loading markets. Please try again later."
        }
        title="Error loading markets"
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

  if (items.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      {/* Filter controls — toggled via filter icon in category bar */}
      {showFilters && (
        <div className="flex items-center gap-2">
          <MarketStatusFilter value={statusFilter} onChange={setStatusFilter} />
        </div>
      )}

      {filteredItems.length === 0 && !hasNextPage ? (
        <EmptyState
          description="No markets match the current filters. Try adjusting your selection."
          title="No markets found"
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map((item: UnifiedFeedItem) => {
              if (item.type === "standalone") {
                return (
                  <MarketCard
                    key={`m-${item.data.marketId}`}
                    market={item.data}
                  />
                );
              }
              if (item.type === "series") {
                return (
                  <PriceSeriesCard
                    key={`s-${item.data.id}`}
                    series={item.data}
                  />
                );
              }

              return (
                <MarketGroupCard
                  key={`g-${item.data.groupId}`}
                  group={item.data}
                />
              );
            })}
            {isFetchingNextPage &&
              Array.from({ length: 4 }).map((_, i) => (
                <MarketSkeleton key={`next-${i}`} />
              ))}
          </div>
          <InfiniteScrollSentinel
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            onLoadMore={fetchNextPage}
          />
        </>
      )}
    </div>
  );
}

function InfiniteScrollSentinel({
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
}) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasNextPage) return;
    const node = sentinelRef.current;

    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage) {
          onLoadMore();
        }
      },
      { rootMargin: "400px 0px" },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, onLoadMore]);

  if (!hasNextPage) return null;

  return <div ref={sentinelRef} aria-hidden className="h-1 w-full" />;
}
