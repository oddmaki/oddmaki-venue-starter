"use client";

import type { MarketType } from "../types";

import { colors, fonts } from "@/lib/tokens";

interface MarketCreationSuccessProps {
  marketType: MarketType;
  marketTitle: string;
  onCreateAnother: () => void;
  onClose?: () => void;
}

const TYPE_LABEL: Record<MarketType, string> = {
  standard: "Market",
  group: "Market group",
  price: "Price market",
};

export function MarketCreationSuccess({
  marketType,
  marketTitle,
  onCreateAnother,
  onClose,
}: MarketCreationSuccessProps) {
  const label = TYPE_LABEL[marketType];

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 14,
          padding: "18px 22px",
          background: `${colors.neonCyan}0d`,
          border: `1px solid ${colors.neonCyan}30`,
          borderRadius: 14,
        }}
      >
        <div
          style={{
            flexShrink: 0,
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: colors.neonCyan,
            color: colors.darkBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontFamily: fonts.sans,
          }}
        >
          ✓
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "white",
              margin: 0,
              fontFamily: fonts.sans,
              letterSpacing: "-0.01em",
            }}
          >
            {label} created
          </h2>
          <p
            style={{
              fontSize: 13,
              color: "#bbb",
              margin: "4px 0 0",
              fontFamily: fonts.sans,
              lineHeight: 1.55,
            }}
          >
            {marketTitle ? (
              <>
                <span style={{ color: "white", fontWeight: 600 }}>
                  {marketTitle}
                </span>{" "}
                is now live on-chain. It will appear on the Markets list shortly
                after the subgraph indexes the event.
              </>
            ) : (
              <>
                The transaction confirmed on-chain. Markets show up after
                subgraph indexing.
              </>
            )}
          </p>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          justifyContent: "flex-end",
          paddingTop: 8,
        }}
      >
        <button
          style={{
            padding: "10px 20px",
            background: "transparent",
            border: "1px solid #ffffff14",
            borderRadius: 8,
            color: "#bbb",
            fontSize: 13,
            cursor: "pointer",
            fontFamily: fonts.sans,
            fontWeight: 500,
          }}
          type="button"
          onClick={onCreateAnother}
        >
          Create another market
        </button>
        <button
          style={{
            padding: "10px 22px",
            background: colors.neonCyan,
            border: "none",
            borderRadius: 8,
            color: colors.darkBg,
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: fonts.sans,
          }}
          type="button"
          onClick={onClose}
        >
          Go to markets
        </button>
      </div>
    </div>
  );
}
