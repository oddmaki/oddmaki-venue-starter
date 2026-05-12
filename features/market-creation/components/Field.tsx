"use client";

import {
  cloneElement,
  isValidElement,
  useState,
  type ReactElement,
} from "react";

import { colors, fonts } from "@/lib/tokens";

interface FieldProps {
  label: string;
  hint?: string;
  required?: boolean;
  children: ReactElement;
}

export function Field({ label, hint, required, children }: FieldProps) {
  const [focused, setFocused] = useState(false);

  const labelColor = focused ? colors.neonCyan : "#cfcfcf";
  const borderColor = focused ? colors.neonCyan : "#ffffff1f";

  const child = isValidElement<{
    onFocus?: (e: React.FocusEvent) => void;
    onBlur?: (e: React.FocusEvent) => void;
    style?: React.CSSProperties;
  }>(children)
    ? cloneElement(children, {
        onFocus: (e: React.FocusEvent) => {
          setFocused(true);
          children.props.onFocus?.(e);
        },
        onBlur: (e: React.FocusEvent) => {
          setFocused(false);
          children.props.onBlur?.(e);
        },
        style: {
          ...(children.props.style ?? {}),
          borderColor,
          outline: "none",
          transition: "border-color 0.15s ease, box-shadow 0.15s ease",
          boxShadow: focused ? `0 0 0 3px ${colors.neonCyan}1f` : "none",
        },
      })
    : children;

  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: 12,
          color: labelColor,
          marginBottom: 6,
          fontFamily: fonts.sans,
          fontWeight: 500,
          letterSpacing: "0.01em",
          transition: "color 0.15s ease",
        }}
      >
        {label}
        {required && (
          <span style={{ color: colors.neonCyan, marginLeft: 4 }}>*</span>
        )}
      </label>
      {child}
      {hint && (
        <div
          style={{
            fontSize: 11,
            color: "#9a9a9a",
            marginTop: 6,
            fontFamily: fonts.sans,
            lineHeight: 1.5,
          }}
        >
          {hint}
        </div>
      )}
    </div>
  );
}

export const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  background: "#181818",
  border: "1px solid #ffffff1f",
  borderRadius: 8,
  color: "white",
  fontSize: 14,
  fontFamily: fonts.sans,
  outline: "none",
};

export const monoInputStyle: React.CSSProperties = {
  ...inputStyle,
  fontFamily: fonts.mono,
};
