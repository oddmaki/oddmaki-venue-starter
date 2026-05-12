"use client";

import type { GroupMarketFormData } from "../../types";

import { Field, inputStyle } from "../Field";
import { InfoCallout } from "../WizardLayout";

import { colors, fonts } from "@/lib/tokens";

const MAX_OUTCOMES = 50;

interface StepGroupOutcomesProps {
  formData: GroupMarketFormData;
  updateField: <K extends keyof GroupMarketFormData>(
    key: K,
    value: GroupMarketFormData[K],
  ) => void;
}

export function StepGroupOutcomes({
  formData,
  updateField,
}: StepGroupOutcomesProps) {
  const updateOutcome = (
    i: number,
    key: "name" | "question",
    value: string,
  ) => {
    updateField(
      "outcomes",
      formData.outcomes.map((o, idx) =>
        idx === i ? { ...o, [key]: value } : o,
      ),
    );
  };

  const addOutcome = () => {
    if (formData.outcomes.length >= MAX_OUTCOMES) return;
    updateField("outcomes", [...formData.outcomes, { name: "", question: "" }]);
  };

  const removeOutcome = (i: number) => {
    if (formData.outcomes.length <= 2) return;
    updateField(
      "outcomes",
      formData.outcomes.filter((_, idx) => idx !== i),
    );
  };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <InfoCallout>
        Each outcome becomes its own binary market sharing the group&apos;s
        collateral. Use NegRisk to convert NO positions into other
        outcomes&apos; YES + collateral. Minimum 2, maximum {MAX_OUTCOMES}.
      </InfoCallout>

      <div style={{ display: "grid", gap: 12 }}>
        {formData.outcomes.map((outcome, i) => (
          <div
            key={i}
            style={{
              padding: 16,
              background: "#181818",
              borderRadius: 12,
              border: "1px solid #ffffff0a",
              display: "grid",
              gap: 10,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  color: colors.neonCyan,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  fontFamily: fonts.sans,
                }}
              >
                Outcome {i + 1}
              </span>
              {formData.outcomes.length > 2 && (
                <button
                  style={{
                    padding: "4px 10px",
                    background: "transparent",
                    border: "1px solid #ffffff14",
                    borderRadius: 6,
                    color: "#bbb",
                    fontSize: 11,
                    cursor: "pointer",
                    fontFamily: fonts.sans,
                  }}
                  type="button"
                  onClick={() => removeOutcome(i)}
                >
                  Remove
                </button>
              )}
            </div>

            <Field required label="Name">
              <input
                maxLength={64}
                placeholder="e.g., Lakers, March 5, $80k–$85k"
                style={inputStyle}
                type="text"
                value={outcome.name}
                onChange={(e) => updateOutcome(i, "name", e.target.value)}
              />
            </Field>

            <Field required label="Resolution question">
              <input
                maxLength={240}
                placeholder="e.g., Will the Lakers win the championship?"
                style={inputStyle}
                type="text"
                value={outcome.question}
                onChange={(e) => updateOutcome(i, "question", e.target.value)}
              />
            </Field>
          </div>
        ))}
      </div>

      <button
        disabled={formData.outcomes.length >= MAX_OUTCOMES}
        style={{
          padding: "10px 14px",
          background: "transparent",
          border: "1px dashed #ffffff20",
          borderRadius: 10,
          color: formData.outcomes.length >= MAX_OUTCOMES ? "#444" : "#bbb",
          fontSize: 12,
          cursor:
            formData.outcomes.length >= MAX_OUTCOMES ? "default" : "pointer",
          fontFamily: fonts.sans,
        }}
        type="button"
        onClick={addOutcome}
      >
        + Add outcome
      </button>
    </div>
  );
}
