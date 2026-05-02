"use client";

import { useState, useMemo, useCallback } from "react";
import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import { Input } from "@heroui/input";
import { Tabs, Tab } from "@heroui/tabs";
import { Chip } from "@heroui/chip";

import { usePythFeeds, type PythFeedOption } from "../hooks/usePythFeeds";

type InputMode = "browse" | "manual";

const PYTH_FEED_ID_REGEX = /^0x[0-9a-fA-F]{64}$/;

const MAX_VISIBLE_ITEMS = 50;

const ASSET_TYPE_ORDER = [
  "Crypto",
  "Equity",
  "FX",
  "Commodities",
  "Metal",
  "Energy",
  "Rates",
];

interface PythFeedSelectorProps {
  feedId: string;
  onFeedIdChange: (feedId: string) => void;
  onFeedSelect?: (feed: PythFeedOption) => void;
  onClearError?: () => void;
}

export function PythFeedSelector({
  feedId,
  onFeedIdChange,
  onFeedSelect,
  onClearError,
}: PythFeedSelectorProps) {
  const [mode, setMode] = useState<InputMode>("browse");
  const [searchValue, setSearchValue] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { feeds, assetTypes, isLoading, isError } = usePythFeeds();

  const sortedAssetTypes = useMemo(() => {
    return [...assetTypes].sort((a, b) => {
      const ia = ASSET_TYPE_ORDER.indexOf(a);
      const ib = ASSET_TYPE_ORDER.indexOf(b);

      return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
    });
  }, [assetTypes]);

  const filteredFeeds = useMemo(() => {
    let result = feeds;

    if (activeCategory) {
      result = result.filter((f) => f.assetType === activeCategory);
    }

    if (searchValue.trim()) {
      const query = searchValue.trim().toLowerCase();

      result = result.filter(
        (f) =>
          f.displaySymbol.toLowerCase().includes(query) ||
          f.base.toLowerCase().includes(query) ||
          f.description.toLowerCase().includes(query),
      );
    }

    return result.slice(0, MAX_VISIBLE_ITEMS);
  }, [feeds, activeCategory, searchValue]);

  const isValidFeedId = PYTH_FEED_ID_REGEX.test(feedId.trim());

  const handleAutocompleteSelect = useCallback(
    (key: React.Key | null) => {
      if (!key) return;
      const selected = feeds.find((f) => f.feedId === key);

      if (selected) {
        onFeedIdChange(selected.feedId);
        onFeedSelect?.(selected);
        onClearError?.();
        setSearchValue(selected.displaySymbol);
      }
    },
    [feeds, onFeedIdChange, onFeedSelect, onClearError],
  );

  return (
    <div className="flex flex-col gap-2">
      <Tabs
        aria-label="Feed input mode"
        classNames={{ tabList: "gap-4" }}
        selectedKey={mode}
        size="sm"
        variant="underlined"
        onSelectionChange={(key) => setMode(key as InputMode)}
      >
        <Tab key="browse" title="Browse Feeds" />
        <Tab key="manual" title="Manual Input" />
      </Tabs>

      {mode === "browse" ? (
        <div className="flex flex-col gap-2">
          <div className="flex gap-1.5 flex-wrap">
            <Chip
              className="cursor-pointer"
              color={activeCategory === null ? "primary" : "default"}
              size="sm"
              variant={activeCategory === null ? "solid" : "bordered"}
              onClick={() => setActiveCategory(null)}
            >
              All
            </Chip>
            {sortedAssetTypes.map((type) => (
              <Chip
                key={type}
                className="cursor-pointer"
                color={activeCategory === type ? "primary" : "default"}
                size="sm"
                variant={activeCategory === type ? "solid" : "bordered"}
                onClick={() =>
                  setActiveCategory(activeCategory === type ? null : type)
                }
              >
                {type}
              </Chip>
            ))}
          </div>

          <Autocomplete
            allowsCustomValue
            isRequired
            description={
              feedId
                ? `Feed ID: ${feedId.slice(0, 10)}...${feedId.slice(-6)}`
                : undefined
            }
            inputValue={searchValue}
            isLoading={isLoading}
            items={filteredFeeds}
            label="Pyth Price Feed"
            listboxProps={{ emptyContent: "No feeds found." }}
            menuTrigger="input"
            placeholder="Search feeds (e.g. ETH, BTC, AAPL)..."
            selectedKey={feedId || undefined}
            onInputChange={setSearchValue}
            onSelectionChange={handleAutocompleteSelect}
          >
            {(feed) => (
              <AutocompleteItem
                key={feed.feedId}
                textValue={feed.displaySymbol}
              >
                <div className="flex items-center justify-between w-full gap-2">
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium">
                      {feed.displaySymbol}
                    </span>
                    <span className="text-xs text-default-400 truncate">
                      {feed.description}
                    </span>
                  </div>
                  <Chip className="text-tiny shrink-0" size="sm" variant="flat">
                    {feed.assetType}
                  </Chip>
                </div>
              </AutocompleteItem>
            )}
          </Autocomplete>
          {isError && (
            <p className="text-warning text-xs">
              Failed to load feeds. Switch to Manual Input to enter a feed ID
              directly.
            </p>
          )}
        </div>
      ) : (
        <Input
          isRequired
          description={
            <span>
              Find feed IDs at{" "}
              <a
                className="text-primary underline"
                href="https://pyth.network/developers/price-feed-ids"
                rel="noopener noreferrer"
                target="_blank"
              >
                pyth.network/developers/price-feed-ids
              </a>
            </span>
          }
          errorMessage={
            feedId.trim() && !isValidFeedId
              ? "Must be a 0x-prefixed 64-character hex string"
              : undefined
          }
          isInvalid={!!feedId.trim() && !isValidFeedId}
          label="Pyth Feed ID"
          placeholder="0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace"
          value={feedId}
          onValueChange={(v) => {
            onFeedIdChange(v);
            onClearError?.();
          }}
        />
      )}
    </div>
  );
}
