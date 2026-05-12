"use client";

import type { PriceMarketFormData, TickSize } from "../../types";

import { Field, inputStyle } from "../Field";
import { TagsInput } from "../TagsInput";

import { colors, fonts } from "@/lib/tokens";

interface StepPriceMetaProps {
  formData: PriceMarketFormData;
  updateField: <K extends keyof PriceMarketFormData>(
    key: K,
    value: PriceMarketFormData[K],
  ) => void;
  autoTitle: string;
  autoDescription: string;
}

const TICK_OPTIONS: { value: TickSize; label: string; description: string }[] =
  [
    {
      value: "0.01",
      label: "$0.01 (1%)",
      description: "100 price levels — standard.",
    },
    {
      value: "0.001",
      label: "$0.001 (0.1%)",
      description: "1,000 price levels — fine-grained.",
    },
  ];

export function StepPriceMeta({
  formData,
  updateField,
  autoTitle,
  autoDescription,
}: StepPriceMetaProps) {
  return (
    <div style={{ display: "grid", gap: 24 }}>
      <Field
        required
        hint={
          autoTitle && !formData.title.trim()
            ? `Will use auto-generated: ${autoTitle}`
            : "How traders see this market in feeds."
        }
        label="Title"
      >
        <input
          maxLength={240}
          placeholder={autoTitle || "ETH/USD Above/Below $4,000"}
          style={inputStyle}
          type="text"
          value={formData.title}
          onChange={(e) => updateField("title", e.target.value)}
        />
      </Field>

      <Field
        hint={
          autoDescription && !formData.description.trim()
            ? `Will use auto-generated: ${autoDescription}`
            : "Optional resolution criteria. Pyth resolution is automatic — this is for traders."
        }
        label="Description"
      >
        <textarea
          placeholder={
            autoDescription ||
            "Resolves Above if Pyth ETH/USD ≥ $4,000 at close time."
          }
          rows={3}
          style={{ ...inputStyle, resize: "vertical" }}
          value={formData.description}
          onChange={(e) => updateField("description", e.target.value)}
        />
      </Field>

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
          Tick size <span style={{ color: colors.neonCyan }}>*</span>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
            gap: 8,
          }}
        >
          {TICK_OPTIONS.map((opt) => {
            const selected = formData.tickSize === opt.value;

            return (
              <button
                key={opt.value}
                style={{
                  padding: "10px 14px",
                  background: selected ? `${colors.neonCyan}14` : "transparent",
                  border: `1px solid ${selected ? `${colors.neonCyan}66` : "#ffffff14"}`,
                  borderRadius: 8,
                  color: selected ? "white" : "#bbb",
                  fontSize: 12,
                  fontFamily: fonts.sans,
                  cursor: "pointer",
                  textAlign: "left",
                }}
                type="button"
                onClick={() => updateField("tickSize", opt.value)}
              >
                <div style={{ fontWeight: 700, marginBottom: 2 }}>
                  {opt.label}
                </div>
                <div
                  style={{ fontSize: 10, color: selected ? "#ddd" : "#9a9a9a" }}
                >
                  {opt.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <Field
        hint="Optional categorization. Surfaced in feeds and explorers."
        label="Tags"
      >
        <div style={{ marginTop: 0 }}>
          <TagsInput
            tags={formData.tags}
            onChange={(t) => updateField("tags", t)}
          />
        </div>
      </Field>
    </div>
  );
}
