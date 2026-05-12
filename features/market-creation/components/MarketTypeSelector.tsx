"use client";

import type { ReactElement } from "react";

import { MARKET_TYPES, type MarketType } from "../types";

import { colors, fonts } from "@/lib/tokens";

interface MarketTypeSelectorProps {
  selected: MarketType | null;
  onSelect: (type: MarketType) => void;
}

const ICONS: Record<MarketType, ReactElement> = {
  standard: (
    <svg fill="none" height="22" viewBox="0 0 24 24" width="22">
      <rect
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
        width="18"
        x="3"
        y="5"
      />
      <path
        d="M8 10h8M8 14h5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.6"
      />
    </svg>
  ),
  group: (
    <svg fill="none" height="22" viewBox="0 0 24 24" width="22">
      <rect
        height="6"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.6"
        width="9"
        x="3"
        y="4"
      />
      <rect
        height="6"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.6"
        width="9"
        x="12"
        y="9"
      />
      <rect
        height="6"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.6"
        width="9"
        x="3"
        y="14"
      />
    </svg>
  ),
  price: (
    <svg fill="none" height="22" viewBox="0 0 24 24" width="22">
      <path
        d="M3 17l5-6 4 4 4-7 5 6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
      <circle cx="8" cy="11" fill="currentColor" r="1.4" />
      <circle cx="12" cy="15" fill="currentColor" r="1.4" />
      <circle cx="16" cy="8" fill="currentColor" r="1.4" />
    </svg>
  ),
};

export function MarketTypeSelector({
  selected,
  onSelect,
}: MarketTypeSelectorProps) {
  return (
    <div
      style={{
        background: colors.darkCard,
        border: "1px solid #ffffff0a",
        borderRadius: 16,
        padding: "clamp(20px, 4vw, 32px)",
      }}
    >
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            fontSize: 11,
            color: "#666",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontFamily: fonts.sans,
            marginBottom: 6,
          }}
        >
          Step 1 of 2
        </div>
        <h2
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: "white",
            margin: 0,
            fontFamily: fonts.sans,
            letterSpacing: "-0.02em",
          }}
        >
          Choose a market type
        </h2>
        <p
          style={{
            fontSize: 13,
            color: "#888",
            margin: "6px 0 0",
            fontFamily: fonts.sans,
            lineHeight: 1.5,
          }}
        >
          Each type has its own configuration flow tailored to how it&apos;s
          resolved on-chain.
        </p>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {MARKET_TYPES.map((opt) => {
          const isSelected = selected === opt.id;

          return (
            <button
              key={opt.id}
              style={{
                textAlign: "left",
                width: "100%",
                padding: "clamp(18px, 2.4vw, 22px)",
                background: isSelected ? `${colors.neonCyan}10` : "#0f0f0f",
                border: `1px solid ${isSelected ? `${colors.neonCyan}66` : "#ffffff0f"}`,
                borderRadius: 14,
                cursor: "pointer",
                color: "white",
                fontFamily: fonts.sans,
                transition: "background 0.15s ease, border-color 0.15s ease",
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                gap: 16,
                alignItems: "flex-start",
              }}
              type="button"
              onClick={() => onSelect(opt.id)}
            >
              <span
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: `${colors.neonCyan}1a`,
                  color: colors.neonCyan,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {ICONS[opt.id]}
              </span>

              <div style={{ minWidth: 0, display: "grid", gap: 8 }}>
                <div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      letterSpacing: "-0.01em",
                      color: colors.neonCyan,
                    }}
                  >
                    {opt.label}
                  </div>
                  <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                    {opt.tagline}
                  </div>
                </div>

                <p
                  style={{
                    fontSize: 13,
                    color: "#bbb",
                    lineHeight: 1.55,
                    margin: 0,
                  }}
                >
                  {opt.description}
                </p>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    paddingLeft: 14,
                    borderLeft: `2px solid ${colors.neonCyan}33`,
                    marginTop: 4,
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      color: "#888",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      fontWeight: 600,
                      marginBottom: 2,
                    }}
                  >
                    Examples
                  </div>
                  {opt.examples.map((ex) => (
                    <div
                      key={ex}
                      style={{
                        fontSize: 12,
                        color: "#cfcfcf",
                        lineHeight: 1.5,
                      }}
                    >
                      &ldquo;{ex}&rdquo;
                    </div>
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
