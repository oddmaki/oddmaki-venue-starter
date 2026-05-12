"use client";

import { type ReactNode } from "react";

import { colors, fonts } from "@/lib/tokens";

interface StepInfo {
  number: number;
  label: string;
  description: string;
}

interface WizardLayoutProps {
  step: StepInfo;
  stepIndex: number;
  totalSteps: number;
  canGoBack: boolean;
  canGoNext: boolean;
  isLastStep: boolean;
  isSubmitting: boolean;
  submitLabel?: string;
  invalidHint?: string;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  children: ReactNode;
  footerExtra?: ReactNode;
}

export function WizardLayout({
  step,
  stepIndex,
  totalSteps,
  canGoBack,
  canGoNext,
  isLastStep,
  isSubmitting,
  submitLabel = "Create",
  invalidHint,
  onBack,
  onNext,
  onSubmit,
  children,
  footerExtra,
}: WizardLayoutProps) {
  const progressPct = ((stepIndex + 1) / totalSteps) * 100;
  const backDisabled = !canGoBack || isSubmitting;

  return (
    <div
      style={{
        background: colors.darkCard,
        border: "1px solid #ffffff0a",
        borderRadius: 16,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "relative",
          height: 3,
          background: "#ffffff08",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            width: `${progressPct}%`,
            background: colors.neonCyan,
            transition: "width 0.3s ease",
          }}
        />
      </div>

      <div
        style={{
          padding: "clamp(24px, 4vw, 32px) clamp(20px, 4vw, 32px) 20px",
          borderBottom: "1px solid #ffffff08",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          <div
            style={{
              flexShrink: 0,
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: colors.neonCyan,
              color: colors.darkBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 700,
              fontFamily: fonts.sans,
              marginTop: 2,
            }}
          >
            {step.number}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 11,
                color: "#666",
                fontFamily: fonts.sans,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 4,
              }}
            >
              Step {step.number} of {totalSteps}
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
              {step.label}
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
              {step.description}
            </p>
          </div>
        </div>
      </div>

      <div style={{ padding: "clamp(24px, 4vw, 32px)", minHeight: 280 }}>
        {children}
        {footerExtra}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px clamp(20px, 4vw, 32px)",
          borderTop: "1px solid #ffffff08",
          background: "#141414",
        }}
      >
        <button
          disabled={backDisabled}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "10px 20px",
            background: "transparent",
            border: "1px solid #ffffff14",
            borderRadius: 8,
            color: backDisabled ? "#444" : "#ddd",
            fontSize: 13,
            fontWeight: 500,
            cursor: backDisabled ? "default" : "pointer",
            fontFamily: fonts.sans,
          }}
          onClick={onBack}
        >
          <svg fill="none" height="10" viewBox="0 0 16 16" width="10">
            <path
              d="M10 3L5 8L10 13"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            />
          </svg>
          Back
        </button>

        {isLastStep ? (
          <button
            disabled={!canGoNext || isSubmitting}
            style={{
              padding: "10px 28px",
              background:
                !canGoNext || isSubmitting ? "#2a2a2a" : colors.neonCyan,
              border: "none",
              borderRadius: 8,
              color: !canGoNext || isSubmitting ? "#666" : colors.darkBg,
              fontSize: 13,
              fontWeight: 700,
              cursor: !canGoNext || isSubmitting ? "default" : "pointer",
              fontFamily: fonts.sans,
            }}
            onClick={onSubmit}
          >
            {isSubmitting ? "Creating…" : submitLabel}
          </button>
        ) : (
          <button
            disabled={!canGoNext}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "10px 24px",
              background: canGoNext ? colors.neonCyan : "#2a2a2a",
              border: "none",
              borderRadius: 8,
              color: canGoNext ? colors.darkBg : "#666",
              fontSize: 13,
              fontWeight: 700,
              cursor: canGoNext ? "pointer" : "not-allowed",
              fontFamily: fonts.sans,
            }}
            title={!canGoNext ? invalidHint : undefined}
            onClick={onNext}
          >
            Next
            <svg fill="none" height="10" viewBox="0 0 16 16" width="10">
              <path
                d="M6 3L11 8L6 13"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export function ReviewSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        padding: 20,
        background: "#181818",
        borderRadius: 12,
        border: "1px solid #ffffff0a",
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: colors.neonCyan,
          fontWeight: 600,
          marginBottom: 12,
          fontFamily: fonts.sans,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

export function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
        padding: "8px 0",
        borderBottom: "1px solid #ffffff06",
      }}
    >
      <span style={{ fontSize: 13, color: "#888", fontFamily: fonts.sans }}>
        {label}
      </span>
      <span
        style={{
          fontSize: 13,
          color: "white",
          fontWeight: 500,
          fontFamily: fonts.mono,
          textAlign: "right",
          maxWidth: "70%",
          wordBreak: "break-word",
        }}
      >
        {value}
      </span>
    </div>
  );
}

export function InfoCallout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        padding: 16,
        background: "#181818",
        borderRadius: 10,
        border: "1px solid #ffffff0a",
        fontSize: 13,
        color: "#bbb",
        lineHeight: 1.6,
        fontFamily: fonts.sans,
      }}
    >
      {children}
    </div>
  );
}
