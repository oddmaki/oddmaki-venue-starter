"use client";

import type { ThemeConfig, ResolvedTheme, ColorScale } from "@/lib/theme";

import React, { useState, useMemo, useCallback } from "react";

import { ThemeOverrideContext } from "../hooks/useThemeOverride";

import { resolveTheme } from "@/lib/theme";
import { hexToHsl, hslToHeroUiValue } from "@/lib/theme/color-utils";

/** Convert a hex color to the HeroUI HSL format string */
function heroVar(hex: string): string {
  const [h, s, l] = hexToHsl(hex);

  return hslToHeroUiValue(h, s, l);
}

/** Emit CSS variable declarations for a color scale */
function scaleVars(name: string, scale: ColorScale): string[] {
  const lines: string[] = [];
  const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;

  for (const shade of shades) {
    lines.push(`  --heroui-${name}-${shade}: ${heroVar(scale[shade])};`);
  }
  lines.push(`  --heroui-${name}: ${heroVar(scale.DEFAULT)};`);
  lines.push(`  --heroui-${name}-foreground: ${heroVar(scale.foreground)};`);

  return lines;
}

/** Generate a full CSS override string from a resolved theme */
function generateOverrideCss(resolved: ResolvedTheme): string {
  const lines: string[] = [];

  // Color scales
  lines.push(...scaleVars("primary", resolved.primary));
  lines.push(...scaleVars("secondary", resolved.secondary));
  lines.push(...scaleVars("success", resolved.success));
  lines.push(...scaleVars("danger", resolved.danger));
  lines.push(...scaleVars("default", resolved.default));

  // Warning (no shade scale)
  lines.push(`  --heroui-warning: ${heroVar(resolved.warning.DEFAULT)};`);
  lines.push(
    `  --heroui-warning-foreground: ${heroVar(resolved.warning.foreground)};`,
  );

  // Single-value slots
  lines.push(`  --heroui-background: ${heroVar(resolved.background)};`);
  lines.push(`  --heroui-foreground: ${heroVar(resolved.foreground)};`);
  lines.push(`  --heroui-content1: ${heroVar(resolved.content1)};`);
  lines.push(`  --heroui-content2: ${heroVar(resolved.content2)};`);
  lines.push(`  --heroui-content3: ${heroVar(resolved.content3)};`);
  lines.push(`  --heroui-content4: ${heroVar(resolved.content4)};`);
  lines.push(`  --heroui-focus: ${heroVar(resolved.focus)};`);

  // Foreground defaults for content slots
  lines.push(
    `  --heroui-content1-foreground: ${heroVar(resolved.foreground)};`,
  );
  lines.push(
    `  --heroui-content2-foreground: ${heroVar(resolved.foreground)};`,
  );
  lines.push(
    `  --heroui-content3-foreground: ${heroVar(resolved.foreground)};`,
  );
  lines.push(
    `  --heroui-content4-foreground: ${heroVar(resolved.foreground)};`,
  );

  return `.dark, [data-theme="dark"] {\n${lines.join("\n")}\n}`;
}

interface ThemeOverrideProviderProps {
  children: React.ReactNode;
}

export function ThemeOverrideProvider({
  children,
}: ThemeOverrideProviderProps) {
  const [overrides, setOverridesState] = useState<ThemeConfig | null>(null);

  const resolved = useMemo<ResolvedTheme | null>(() => {
    if (!overrides) return null;

    return resolveTheme(overrides);
  }, [overrides]);

  const cssText = useMemo<string | null>(() => {
    if (!resolved) return null;

    return generateOverrideCss(resolved);
  }, [resolved]);

  const setOverrides = useCallback((config: ThemeConfig) => {
    setOverridesState(config);
  }, []);

  const clearOverrides = useCallback(() => {
    setOverridesState(null);
  }, []);

  return (
    <ThemeOverrideContext.Provider
      value={{ overrides, resolved, setOverrides, clearOverrides }}
    >
      {cssText && (
        <style
          dangerouslySetInnerHTML={{ __html: cssText }}
          data-theme-override=""
        />
      )}
      {children}
    </ThemeOverrideContext.Provider>
  );
}
