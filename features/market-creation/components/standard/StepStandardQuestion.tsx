"use client";

import type { StandardMarketFormData } from "../../types";

import { Field, inputStyle } from "../Field";

interface StepStandardQuestionProps {
  formData: StandardMarketFormData;
  updateField: <K extends keyof StandardMarketFormData>(
    key: K,
    value: StandardMarketFormData[K],
  ) => void;
}

export function StepStandardQuestion({
  formData,
  updateField,
}: StepStandardQuestionProps) {
  return (
    <div style={{ display: "grid", gap: 24 }}>
      <Field
        required
        hint="The question traders will see — phrase as a yes/no question for binary markets."
        label="Market Question"
      >
        <input
          maxLength={240}
          placeholder="Will BTC reach $100k by end of 2026?"
          style={inputStyle}
          type="text"
          value={formData.title}
          onChange={(e) => updateField("title", e.target.value)}
        />
      </Field>

      <Field
        required
        hint="Exact rules for how the market resolves. Be specific — UMA asserters use this to settle disputes."
        label="Resolution Criteria"
      >
        <textarea
          placeholder="Resolves YES if the price of BTC on CoinGecko exceeds $100,000 at any point before January 1, 2027."
          rows={4}
          style={{ ...inputStyle, resize: "vertical" }}
          value={formData.description}
          onChange={(e) => updateField("description", e.target.value)}
        />
      </Field>
    </div>
  );
}
