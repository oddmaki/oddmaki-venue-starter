import type { ThemeConfig, ResolvedTheme } from "./types";

import {
  generateColorScale,
  generateDefaultScale,
  autoForeground,
  lighten,
} from "./color-utils";

const DEFAULTS = {
  background: "#121312",
  foreground: "#FFFFFF",
  card: "#181818",
  success: "#00E68C",
  warning: "#FFB800",
  danger: "#FF6B6B",
} as const;

/** Resolve a minimal ThemeConfig into a full ResolvedTheme with shade scales */
export function resolveTheme(config: ThemeConfig): ResolvedTheme {
  const bg = config.surfaces?.background ?? DEFAULTS.background;
  const fg =
    config.surfaces?.foreground ??
    autoForeground(bg, "#000000", DEFAULTS.foreground);
  const card = config.surfaces?.card ?? DEFAULTS.card;

  return {
    primary: generateColorScale(config.brand.primary, bg),
    secondary: generateColorScale(config.brand.secondary, bg),
    success: generateColorScale(
      config.semantic?.success ?? DEFAULTS.success,
      bg,
    ),
    warning: {
      DEFAULT: config.semantic?.warning ?? DEFAULTS.warning,
      foreground: autoForeground(
        config.semantic?.warning ?? DEFAULTS.warning,
        bg,
        fg,
      ),
    },
    danger: generateColorScale(config.semantic?.danger ?? DEFAULTS.danger, bg),
    default: generateDefaultScale(card, fg),
    background: bg,
    foreground: fg,
    content1: card,
    content2: lighten(card, 0.04),
    content3: lighten(card, 0.08),
    content4: lighten(card, 0.12),
    focus: config.brand.primary,
  };
}

/** Convert a ResolvedTheme into the shape consumed by HeroUI's heroui() plugin */
export function toHeroThemeColors(resolved: ResolvedTheme) {
  return {
    background: resolved.background,
    foreground: resolved.foreground,
    primary: resolved.primary,
    secondary: resolved.secondary,
    success: resolved.success,
    warning: resolved.warning,
    danger: resolved.danger,
    default: resolved.default,
    content1: resolved.content1,
    content2: resolved.content2,
    content3: resolved.content3,
    content4: resolved.content4,
    focus: resolved.focus,
  } as const;
}
