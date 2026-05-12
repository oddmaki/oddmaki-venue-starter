"use client";

import { useState, type KeyboardEvent } from "react";

import { inputStyle } from "./Field";

import { colors, fonts } from "@/lib/tokens";

interface TagsInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxLength?: number;
  maxTags?: number;
}

export function TagsInput({
  tags,
  onChange,
  placeholder = "Type a tag and press Enter",
  maxLength = 31,
  maxTags = 10,
}: TagsInputProps) {
  const [draft, setDraft] = useState("");

  const commit = () => {
    const v = draft.trim().toLowerCase();

    if (!v) return;
    if (tags.includes(v)) {
      setDraft("");

      return;
    }
    if (tags.length >= maxTags) return;
    onChange([...tags, v.slice(0, maxLength)]);
    setDraft("");
  };

  const remove = (t: string) => onChange(tags.filter((x) => x !== t));

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit();
    } else if (e.key === "Backspace" && draft === "" && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          padding: 8,
          background: "#181818",
          border: "1px solid #ffffff1f",
          borderRadius: 8,
        }}
      >
        {tags.map((t) => (
          <span
            key={t}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 10px",
              fontSize: 12,
              fontFamily: fonts.sans,
              color: colors.neonCyan,
              background: `${colors.neonCyan}14`,
              border: `1px solid ${colors.neonCyan}40`,
              borderRadius: 100,
            }}
          >
            {t}
            <button
              aria-label={`Remove tag ${t}`}
              style={{
                background: "transparent",
                border: "none",
                color: "inherit",
                fontSize: 14,
                lineHeight: 1,
                cursor: "pointer",
                padding: 0,
              }}
              type="button"
              onClick={() => remove(t)}
            >
              ×
            </button>
          </span>
        ))}
        <input
          placeholder={tags.length === 0 ? placeholder : ""}
          style={{
            ...inputStyle,
            background: "transparent",
            border: "none",
            padding: "4px 6px",
            flex: 1,
            minWidth: 120,
          }}
          value={draft}
          onBlur={commit}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKey}
        />
      </div>
      <div
        style={{
          fontSize: 11,
          color: "#9a9a9a",
          marginTop: 6,
          fontFamily: fonts.sans,
        }}
      >
        {tags.length}/{maxTags} tags · max {maxLength} chars · stored as bytes32
        on-chain
      </div>
    </div>
  );
}
