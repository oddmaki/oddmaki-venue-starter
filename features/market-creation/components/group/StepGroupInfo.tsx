"use client";

import type { GroupMarketFormData } from "../../types";

import { Field, inputStyle } from "../Field";

interface StepGroupInfoProps {
  formData: GroupMarketFormData;
  updateField: <K extends keyof GroupMarketFormData>(
    key: K,
    value: GroupMarketFormData[K],
  ) => void;
}

export function StepGroupInfo({ formData, updateField }: StepGroupInfoProps) {
  return (
    <div style={{ display: "grid", gap: 24 }}>
      <Field
        required
        hint="The umbrella question shared by every outcome — e.g. “Who will win the 2027 Super Bowl?”."
        label="Group Question"
      >
        <input
          maxLength={240}
          placeholder="Who will win the championship?"
          style={inputStyle}
          type="text"
          value={formData.title}
          onChange={(e) => updateField("title", e.target.value)}
        />
      </Field>

      <Field
        required
        hint="How outcomes resolve. UMA asserters use this when reporting which outcome won."
        label="Resolution Criteria"
      >
        <textarea
          placeholder="Resolves YES for the team that wins the official championship game per espn.com. All other outcomes resolve NO."
          rows={4}
          style={{ ...inputStyle, resize: "vertical" }}
          value={formData.description}
          onChange={(e) => updateField("description", e.target.value)}
        />
      </Field>
    </div>
  );
}
