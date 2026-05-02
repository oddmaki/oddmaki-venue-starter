"use client";

import type { ThemeConfig, ResolvedTheme } from "@/lib/theme";

import { createContext, useContext } from "react";

export interface ThemeOverrideContextValue {
  /** Current overrides (null = using build-time defaults) */
  overrides: ThemeConfig | null;
  /** The resolved theme (from overrides, or null if using build-time defaults) */
  resolved: ResolvedTheme | null;
  /** Apply a runtime override */
  setOverrides: (config: ThemeConfig) => void;
  /** Clear all runtime overrides, revert to build-time */
  clearOverrides: () => void;
}

export const ThemeOverrideContext = createContext<ThemeOverrideContextValue>({
  overrides: null,
  resolved: null,
  setOverrides: () => {},
  clearOverrides: () => {},
});

export function useThemeOverride() {
  return useContext(ThemeOverrideContext);
}
