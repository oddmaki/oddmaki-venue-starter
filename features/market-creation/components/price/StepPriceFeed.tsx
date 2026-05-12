"use client";

import type { PriceMarketFormData } from "../../types";

import { useEffect, useMemo, useState } from "react";

import { Field, inputStyle, monoInputStyle } from "../Field";
import { InfoCallout } from "../WizardLayout";
import {
  PYTH_FEEDS,
  PYTH_FEED_ID_REGEX,
  PYTH_FEED_MAP,
  fetchPythLatest,
} from "../../lib/pythFeeds";

import { colors, fonts } from "@/lib/tokens";

interface StepPriceFeedProps {
  formData: PriceMarketFormData;
  updateField: <K extends keyof PriceMarketFormData>(
    key: K,
    value: PriceMarketFormData[K],
  ) => void;
}

export function StepPriceFeed({ formData, updateField }: StepPriceFeedProps) {
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [loadingPrice, setLoadingPrice] = useState(false);

  const isValidFeed = useMemo(
    () => PYTH_FEED_ID_REGEX.test(formData.pythFeedId.trim()),
    [formData.pythFeedId],
  );

  useEffect(() => {
    if (!isValidFeed) {
      setCurrentPrice(null);

      return;
    }
    const ctrl = new AbortController();

    setLoadingPrice(true);
    fetchPythLatest(formData.pythFeedId.trim(), ctrl.signal).then((latest) => {
      setLoadingPrice(false);
      if (!latest) {
        setCurrentPrice(null);

        return;
      }
      setCurrentPrice(latest.price);
      if (latest.expo !== formData.priceExpo) {
        updateField("priceExpo", latest.expo);
      }
    });

    return () => ctrl.abort();
  }, [formData.pythFeedId, isValidFeed, formData.priceExpo, updateField]);

  const selectFeed = (id: string, symbol: string) => {
    updateField("pythFeedId", id);
    updateField("feedSymbol", symbol);
    const known = PYTH_FEED_MAP.get(id as `0x${string}`);

    if (known) updateField("priceExpo", known.expo);
  };

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <InfoCallout>
        Price markets resolve automatically against a Pyth Network price feed.
        Pick a feed and choose between Up/Down (vs. price at creation) or
        Above/Below a target strike price.
      </InfoCallout>

      <div>
        <div
          style={{
            fontSize: 12,
            color: "#cfcfcf",
            marginBottom: 8,
            fontFamily: fonts.sans,
            fontWeight: 500,
          }}
        >
          Curated feeds
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {PYTH_FEEDS.map((feed) => {
            const selected =
              formData.pythFeedId.toLowerCase() === feed.id.toLowerCase();

            return (
              <button
                key={feed.id}
                style={{
                  padding: "10px 14px",
                  background: selected ? `${colors.neonCyan}14` : "#0f0f0f",
                  border: `1px solid ${selected ? `${colors.neonCyan}66` : "#ffffff14"}`,
                  borderRadius: 10,
                  color: selected ? "white" : "#bbb",
                  fontSize: 12,
                  fontFamily: fonts.sans,
                  cursor: "pointer",
                  textAlign: "left",
                }}
                type="button"
                onClick={() => selectFeed(feed.id, feed.symbol)}
              >
                <div style={{ fontWeight: 700 }}>{feed.symbol}</div>
                <div style={{ fontSize: 10, color: "#888", marginTop: 2 }}>
                  {feed.name}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <Field
        required
        hint="Paste any Pyth feed id from pyth.network/developers/price-feed-ids."
        label="Pyth Feed ID"
      >
        <input
          placeholder="0x…"
          style={monoInputStyle}
          type="text"
          value={formData.pythFeedId}
          onChange={(e) => updateField("pythFeedId", e.target.value.trim())}
        />
      </Field>

      {isValidFeed && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 14,
            background: "#0f0f0f",
            borderRadius: 10,
            border: "1px solid #ffffff10",
            fontFamily: fonts.sans,
          }}
        >
          <span style={{ fontSize: 12, color: "#888" }}>Latest price</span>
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "white",
              fontFamily: fonts.mono,
            }}
          >
            {loadingPrice
              ? "Fetching…"
              : currentPrice !== null
                ? `$${currentPrice.toLocaleString(undefined, { maximumFractionDigits: 6 })}`
                : "—"}
          </span>
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
          padding: 14,
          background: "#181818",
          borderRadius: 10,
          border: "1px solid #ffffff0a",
        }}
      >
        <input
          checked={formData.useStrikePrice}
          id="useStrikePrice"
          style={{ marginTop: 3, accentColor: colors.neonCyan }}
          type="checkbox"
          onChange={(e) => updateField("useStrikePrice", e.target.checked)}
        />
        <label htmlFor="useStrikePrice" style={{ flex: 1, cursor: "pointer" }}>
          <div
            style={{
              fontSize: 13,
              color: "white",
              fontFamily: fonts.sans,
              fontWeight: 600,
            }}
          >
            Resolve against a target strike price
          </div>
          <div
            style={{
              fontSize: 11,
              color: "#9a9a9a",
              marginTop: 4,
              fontFamily: fonts.sans,
              lineHeight: 1.55,
            }}
          >
            {formData.useStrikePrice
              ? "Outcomes are Above / Below your strike at close time."
              : "Outcomes are Up / Down vs. the Pyth price captured at creation."}
          </div>
        </label>
      </div>

      {formData.useStrikePrice && (
        <Field
          required
          hint={
            currentPrice !== null
              ? `Current ${formData.feedSymbol || "feed"} price: $${currentPrice.toLocaleString(undefined, { maximumFractionDigits: 6 })}`
              : "The market resolves Above if the Pyth price ≥ strike at close."
          }
          label="Strike price (USD)"
        >
          <input
            placeholder="e.g. 100000"
            style={inputStyle}
            type="number"
            value={formData.strikePrice}
            onChange={(e) => updateField("strikePrice", e.target.value)}
          />
        </Field>
      )}
    </div>
  );
}
