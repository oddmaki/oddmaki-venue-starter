"use client";

import type { StandardMarketFormData } from "../../types";

import { Field, inputStyle } from "../Field";
import { InfoCallout } from "../WizardLayout";

import { colors, fonts } from "@/lib/tokens";

interface StepStandardOutcomesProps {
  formData: StandardMarketFormData;
  updateField: <K extends keyof StandardMarketFormData>(
    key: K,
    value: StandardMarketFormData[K],
  ) => void;
}

const MODES: { id: "binary" | "custom"; label: string; description: string }[] =
  [
    {
      id: "binary",
      label: "Yes / No",
      description: "Standard YES/NO labels. Best for most binary questions.",
    },
    {
      id: "custom",
      label: "Custom labels",
      description:
        "Pick your own two-outcome labels (e.g. Above/Below, Pass/Fail).",
    },
  ];

export function StepStandardOutcomes({
  formData,
  updateField,
}: StepStandardOutcomesProps) {
  const setMode = (mode: "binary" | "custom") => {
    if (mode === "binary") {
      updateField("outcomes", ["Yes", "No"]);
    } else {
      updateField("outcomes", ["", ""]);
    }
    updateField("outcomeMode", mode);
  };

  const updateOutcome = (i: number, value: string) => {
    const next: [string, string] = [
      i === 0 ? value : (formData.outcomes[0] ?? ""),
      i === 1 ? value : (formData.outcomes[1] ?? ""),
    ];

    updateField("outcomes", next);
  };

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <InfoCallout>
        Binary markets always have exactly two complementary outcomes that price
        between 0 and 1 and sum to 1. To support multiple competing answers
        (e.g. an election with N candidates), use a Market Group instead.
      </InfoCallout>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
          gap: 12,
        }}
      >
        {MODES.map((opt) => {
          const selected = formData.outcomeMode === opt.id;

          return (
            <button
              key={opt.id}
              style={{
                padding: 16,
                background: selected ? `${colors.neonCyan}10` : "#0f0f0f",
                border: `1px solid ${selected ? `${colors.neonCyan}66` : "#ffffff14"}`,
                borderRadius: 12,
                color: selected ? "white" : "#bbb",
                cursor: "pointer",
                textAlign: "left",
                fontFamily: fonts.sans,
              }}
              type="button"
              onClick={() => setMode(opt.id)}
            >
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                {opt.label}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: selected ? "#ddd" : "#888",
                  lineHeight: 1.5,
                }}
              >
                {opt.description}
              </div>
            </button>
          );
        })}
      </div>

      {formData.outcomeMode === "custom" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
            gap: 12,
          }}
        >
          <Field
            required
            hint="The “YES-equivalent” label, priced 0–1."
            label="Outcome A"
          >
            <input
              maxLength={48}
              placeholder="e.g., Above"
              style={inputStyle}
              type="text"
              value={formData.outcomes[0] ?? ""}
              onChange={(e) => updateOutcome(0, e.target.value)}
            />
          </Field>
          <Field
            required
            hint="The complementary outcome (sum-to-1 with A)."
            label="Outcome B"
          >
            <input
              maxLength={48}
              placeholder="e.g., Below"
              style={inputStyle}
              type="text"
              value={formData.outcomes[1] ?? ""}
              onChange={(e) => updateOutcome(1, e.target.value)}
            />
          </Field>
        </div>
      )}
    </div>
  );
}
