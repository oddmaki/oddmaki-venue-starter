"use client";

import type { StandardMarketFormData, TickSize } from "../../types";

import { Field, monoInputStyle } from "../Field";
import { TagsInput } from "../TagsInput";

import { colors, fonts } from "@/lib/tokens";

interface StepStandardSettingsProps {
  formData: StandardMarketFormData;
  updateField: <K extends keyof StandardMarketFormData>(
    key: K,
    value: StandardMarketFormData[K],
  ) => void;
  baseUmaReward: number | null;
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

const LIVENESS_PRESETS: { label: string; seconds: number }[] = [
  { label: "Default (2h)", seconds: 0 },
  { label: "30 minutes", seconds: 1800 },
  { label: "1 hour", seconds: 3600 },
  { label: "4 hours", seconds: 14400 },
  { label: "24 hours", seconds: 86400 },
];

export function StepStandardSettings({
  formData,
  updateField,
  baseUmaReward,
}: StepStandardSettingsProps) {
  return (
    <div style={{ display: "grid", gap: 24 }}>
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
        hint={
          baseUmaReward !== null
            ? `On top of the venue's ${baseUmaReward} USDC base reward. Optional, can be 0.`
            : "Optional reward boost for UMA asserters, on top of the venue default."
        }
        label="Additional UMA reward (USDC)"
      >
        <input
          min={0}
          step={1}
          style={monoInputStyle}
          type="number"
          value={formData.additionalReward}
          onChange={(e) =>
            updateField(
              "additionalReward",
              Math.max(0, parseFloat(e.target.value) || 0),
            )
          }
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
          UMA Challenge Period
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {LIVENESS_PRESETS.map((p) => {
            const selected = formData.liveness === p.seconds;

            return (
              <button
                key={p.label}
                style={{
                  padding: "8px 14px",
                  background: selected ? `${colors.neonCyan}14` : "transparent",
                  border: `1px solid ${selected ? `${colors.neonCyan}66` : "#ffffff14"}`,
                  borderRadius: 8,
                  color: selected ? "white" : "#bbb",
                  fontSize: 12,
                  fontFamily: fonts.sans,
                  cursor: "pointer",
                }}
                type="button"
                onClick={() => updateField("liveness", p.seconds)}
              >
                {p.label}
              </button>
            );
          })}
        </div>
        <div
          style={{
            fontSize: 11,
            color: "#9a9a9a",
            marginTop: 8,
            fontFamily: fonts.sans,
            lineHeight: 1.5,
          }}
        >
          Window during which an asserted resolution can be disputed. Longer
          windows give more time to challenge bad assertions.
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
