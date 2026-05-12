"use client";

import type { PriceMarketFormData } from "../../types";

import { useEffect, useMemo, useState } from "react";

import { Field, inputStyle } from "../Field";
import { PYTH_DURATION_PRESETS } from "../../lib/pythFeeds";

import { colors, fonts } from "@/lib/tokens";

interface StepPriceWindowProps {
  formData: PriceMarketFormData;
  updateField: <K extends keyof PriceMarketFormData>(
    key: K,
    value: PriceMarketFormData[K],
  ) => void;
}

const TIMEZONES: { label: string; value: string }[] = [
  { label: "Local time", value: "local" },
  { label: "UTC", value: "UTC" },
  { label: "New York (ET)", value: "America/New_York" },
  { label: "Los Angeles (PT)", value: "America/Los_Angeles" },
  { label: "London", value: "Europe/London" },
  { label: "Berlin (CET)", value: "Europe/Berlin" },
  { label: "Tokyo (JST)", value: "Asia/Tokyo" },
  { label: "Singapore", value: "Asia/Singapore" },
];

function resolveTz(value: string): string {
  if (value === "local") {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  return value;
}

function tzAbbreviation(tz: string): string {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "short",
    }).formatToParts(new Date());

    return parts.find((p) => p.type === "timeZoneName")?.value ?? tz;
  } catch {
    return tz;
  }
}

function toDatetimeLocalInTz(utcMs: number, tz: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(utcMs));
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "00";

  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

function parseDatetimeLocalInTz(value: string, tz: string): number {
  const [datePart, timePart] = value.split("T");

  if (!datePart || !timePart) return 0;
  const [y, m, d] = datePart.split("-").map(Number);
  const [h, min] = timePart.split(":").map(Number);
  const naiveUtc = Date.UTC(y, m - 1, d, h, min);
  const formatted = toDatetimeLocalInTz(naiveUtc, tz);
  const [fDate, fTime] = formatted.split("T");
  const [fy, fm, fd] = fDate.split("-").map(Number);
  const [fh, fmin] = fTime.split(":").map(Number);
  const formattedUtc = Date.UTC(fy, fm - 1, fd, fh, fmin);
  const offset = formattedUtc - naiveUtc;

  return naiveUtc - offset;
}

const LIVENESS_PRESETS: { label: string; seconds: number }[] = [
  { label: "Default (2h)", seconds: 0 },
  { label: "30 minutes", seconds: 1800 },
  { label: "1 hour", seconds: 3600 },
  { label: "4 hours", seconds: 14400 },
];

export function StepPriceWindow({
  formData,
  updateField,
}: StepPriceWindowProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);

    return () => clearInterval(t);
  }, []);

  const effectiveTz = useMemo(
    () => resolveTz(formData.customTimezone),
    [formData.customTimezone],
  );
  const tzAbbr = useMemo(() => tzAbbreviation(effectiveTz), [effectiveTz]);

  const closeTimeUnix = useMemo(() => {
    if (formData.closeMode === "preset") {
      return Math.floor(now / 1000) + formData.presetSeconds;
    }
    if (!formData.customDatetime) return null;

    return Math.floor(
      parseDatetimeLocalInTz(formData.customDatetime, effectiveTz) / 1000,
    );
  }, [
    formData.closeMode,
    formData.presetSeconds,
    formData.customDatetime,
    effectiveTz,
    now,
  ]);

  const closeDisplay = useMemo(() => {
    if (closeTimeUnix === null) return null;
    try {
      return (
        new Intl.DateTimeFormat("en-US", {
          timeZone: effectiveTz,
          dateStyle: "medium",
          timeStyle: "short",
        }).format(new Date(closeTimeUnix * 1000)) + ` (${tzAbbr})`
      );
    } catch {
      return new Date(closeTimeUnix * 1000).toLocaleString();
    }
  }, [closeTimeUnix, effectiveTz, tzAbbr]);

  const minDatetime = toDatetimeLocalInTz(now + 5 * 60_000, effectiveTz);

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
          Close time <span style={{ color: colors.neonCyan }}>*</span>
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            marginBottom: 12,
          }}
        >
          {PYTH_DURATION_PRESETS.map((preset) => {
            const selected =
              formData.closeMode === "preset" &&
              formData.presetSeconds === preset.seconds;

            return (
              <button
                key={preset.label}
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
                onClick={() => {
                  updateField("closeMode", "preset");
                  updateField("presetSeconds", preset.seconds);
                }}
              >
                {preset.label}
              </button>
            );
          })}
          <button
            style={{
              padding: "8px 14px",
              background:
                formData.closeMode === "custom"
                  ? `${colors.neonCyan}14`
                  : "transparent",
              border: `1px solid ${formData.closeMode === "custom" ? `${colors.neonCyan}66` : "#ffffff14"}`,
              borderRadius: 8,
              color: formData.closeMode === "custom" ? "white" : "#bbb",
              fontSize: 12,
              fontFamily: fonts.sans,
              cursor: "pointer",
            }}
            type="button"
            onClick={() => updateField("closeMode", "custom")}
          >
            Custom
          </button>
        </div>

        {formData.closeMode === "custom" && (
          <div style={{ display: "grid", gap: 10 }}>
            <Field label="Timezone">
              <select
                style={{
                  ...inputStyle,
                  appearance: "none",
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3e%3cpath fill='none' stroke='%23bbb' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' d='M1 1l5 5 5-5'/%3e%3c/svg%3e\")",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 14px center",
                  paddingRight: 36,
                }}
                value={formData.customTimezone}
                onChange={(e) => updateField("customTimezone", e.target.value)}
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                    {tz.value === "local"
                      ? ` (${tzAbbr})`
                      : ` (${tzAbbreviation(tz.value)})`}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              required
              hint={`Must be at least 5 minutes from now. Wall clock in ${tzAbbr}.`}
              label="Close at"
            >
              <input
                min={minDatetime}
                style={inputStyle}
                type="datetime-local"
                value={formData.customDatetime}
                onChange={(e) => updateField("customDatetime", e.target.value)}
              />
            </Field>
          </div>
        )}

        {closeDisplay && (
          <div
            style={{
              fontSize: 12,
              color: "#9a9a9a",
              marginTop: 8,
              fontFamily: fonts.sans,
            }}
          >
            Closes at:{" "}
            <span style={{ color: "white", fontWeight: 600 }}>
              {closeDisplay}
            </span>
          </div>
        )}
      </div>

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
          UMA fallback challenge period
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
            lineHeight: 1.55,
          }}
        >
          Used only if Pyth resolution fails and the market falls back to UMA.
        </div>
      </div>

      <Field
        hint="How far the Pyth price publish-time may differ from close time. 0 = use protocol default (60s)."
        label="Pyth resolution window (seconds)"
      >
        <input
          min={0}
          step={5}
          style={inputStyle}
          type="number"
          value={formData.resolutionWindow}
          onChange={(e) =>
            updateField(
              "resolutionWindow",
              Math.max(0, parseInt(e.target.value) || 0),
            )
          }
        />
      </Field>
    </div>
  );
}
