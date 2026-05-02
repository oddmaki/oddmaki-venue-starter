"use client";

import type { SortMode } from "@/config/tags.config";

import { useCallback } from "react";
import { Button } from "@heroui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@heroui/popover";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

import { useCategoryOverflow } from "../hooks/useCategoryOverflow";
import { useFilterToggle } from "../hooks/useFilterToggle";

import { CATEGORIES, SORT_MODES } from "@/config/tags.config";
import { FilterIcon } from "@/components/icons";

export function CategoryFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { showFilters, toggleFilters } = useFilterToggle();

  const isHomePage = pathname === "/";
  const currentSort = searchParams.get("sort");
  const currentCategory = isHomePage ? searchParams.get("category") : null;

  // Determine active sort mode (trending is default when no sort param and no category)
  const activeSortMode: SortMode = currentSort === "new" ? "new" : "trending";

  // Overflow detection for categories
  const { containerRef, setItemRef, visibleCount } = useCategoryOverflow(
    CATEGORIES.length,
  );

  const overflowCategories = CATEGORIES.slice(visibleCount);

  const handleSortClick = useCallback(
    (sortId: SortMode) => {
      if (sortId === "trending") {
        router.push("/");
      } else {
        router.push("/?sort=new");
      }
    },
    [router],
  );

  const handleCategoryClick = useCallback(
    (categoryId: string) => {
      if (currentCategory === categoryId) {
        router.push("/");
      } else {
        router.push(`/?category=${categoryId}`);
      }
    },
    [router, currentCategory],
  );

  const isSortActive = (sortId: SortMode) =>
    isHomePage && !currentCategory && activeSortMode === sortId;

  const isCategoryActive = (categoryId: string) =>
    isHomePage && currentCategory === categoryId;

  return (
    <div className="flex items-center gap-1 min-w-0">
      {/* Sort mode buttons */}
      {SORT_MODES.map((mode) => (
        <Button
          key={mode.id}
          className={`flex-shrink-0 text-sm font-medium ${
            isSortActive(mode.id) ? "" : "text-default-600"
          }`}
          color={isSortActive(mode.id) ? "primary" : "default"}
          size="sm"
          variant="light"
          onPress={() => handleSortClick(mode.id)}
        >
          {mode.label}
        </Button>
      ))}

      {/* Vertical divider */}
      <div className="w-px h-5 bg-divider self-center mx-1 flex-shrink-0" />

      {/* Category buttons with overflow detection */}
      <div
        ref={containerRef}
        className="flex items-center gap-1 overflow-hidden flex-1 min-w-0"
      >
        {CATEGORIES.map((category, index) => (
          <div
            key={category.id}
            ref={setItemRef(index)}
            className={`flex-shrink-0 ${index >= visibleCount ? "invisible" : ""}`}
          >
            <Button
              className={`font-medium text-sm ${
                isCategoryActive(category.id) ? "" : "text-default-600"
              }`}
              color={isCategoryActive(category.id) ? "primary" : "default"}
              size="sm"
              variant="light"
              onPress={() => handleCategoryClick(category.id)}
            >
              {category.label}
            </Button>
          </div>
        ))}
      </div>

      {/* More button with overflow items */}
      {overflowCategories.length > 0 && (
        <Popover placement="bottom-end">
          <PopoverTrigger>
            <Button
              className="flex-shrink-0 text-default-500 font-medium"
              endContent={
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M19 9l-7 7-7-7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              }
              size="sm"
              variant="light"
            >
              More
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <div className="flex flex-col gap-1 p-1">
              {overflowCategories.map((category) => (
                <Button
                  key={category.id}
                  className="justify-start"
                  color={isCategoryActive(category.id) ? "primary" : "default"}
                  size="sm"
                  variant={isCategoryActive(category.id) ? "solid" : "light"}
                  onPress={() => handleCategoryClick(category.id)}
                >
                  {category.label}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}

      {/* Filter toggle */}
      <Button
        isIconOnly
        aria-label="Toggle filters"
        className={`flex-shrink-0 ${showFilters ? "text-primary" : "text-default-600"}`}
        size="md"
        variant="light"
        onPress={toggleFilters}
      >
        <FilterIcon size={24} />
      </Button>
    </div>
  );
}
