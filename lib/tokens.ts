// ═══════════════════════════════════════════════════════════════
// OddMaki Design Tokens
// Single source of truth for all design constants.
// Import from here — never hardcode values in components.
//
// Brand colors are driven by theme.config.json via lib/theme/.
// To change the venue's brand, edit theme.config.json and rebuild.
// ═══════════════════════════════════════════════════════════════

import type { ThemeConfig } from "./theme";

import themeConfig from "../theme.config.json";

import { resolveTheme, toHeroThemeColors } from "./theme";

// ─── RESOLVE THEME FROM CONFIG ──────────────────────────────

const resolved = resolveTheme(themeConfig as ThemeConfig);

// ─── COLORS ─────────────────────────────────────────────────

export const colors = {
  // Primary brand (from config)
  neonCyan: themeConfig.brand.primary,
  neonMagenta: themeConfig.brand.secondary,
  neonBlue: "#4D7CFF",

  // Backgrounds (from resolved theme)
  darkBg: resolved.background,
  darkCard: resolved.content1,
  darkCardBorder: "#ffffff0A", // 4% white

  // Text hierarchy
  textPrimary: "#FFFFFF",
  textSecondary: "#AAAAAA",
  textMuted: "#888888",
  textSubtle: "#666666",
  textFaint: "#555555",
  textGhost: "#444444",
  textDisabled: "#333333",

  // Semantic (from resolved theme)
  success: resolved.success.DEFAULT,
  error: resolved.danger.DEFAULT,
  warning: resolved.warning.DEFAULT,

  // External brand (used in specific visuals)
  base: "#0052FF",

  // Overlay & transparency
  blurOverlay: resolved.background + "90", // 56% opacity
  navOverlay: resolved.background + "CC", // 80% opacity
  subtitleBg: resolved.background + "BB", // 73% opacity
} as const;

// Alpha utility: append hex alpha to any color
// Usage: alpha(colors.neonCyan, 0.15) → "#00F0FF26"
export function alpha(hex: string, opacity: number): string {
  const a = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, "0");

  // Strip any existing alpha
  return hex.slice(0, 7) + a;
}

// ─── TYPOGRAPHY ──────────────────────────────────────────────

export const fonts = {
  sans: "'Inter', system-ui, sans-serif",
  mono: "'JetBrains Mono', monospace",
} as const;

export const fontSizes = {
  xs: 9, // column headers, timestamps
  sm: 10, // labels, badges, uppercase headers
  base: 12, // body small, links, nav items
  md: 13, // nav items, table text
  lg: 14, // body text, descriptions
  xl: 15, // subtitle, section intros
  "2xl": 16, // section body, button large
  "3xl": 22, // mobile headings
  "4xl": 28, // desktop sub-headings, use case titles
  "5xl": 36, // section headings (desktop, via clamp)
  "6xl": 48, // hero heading minimum
  "7xl": 84, // hero heading maximum
} as const;

export const fontWeights = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
} as const;

export const lineHeights = {
  tight: 1.05, // hero heading
  snug: 1.15, // section headings
  normal: 1.2, // sub-headings
  relaxed: 1.5, // cards, compact text
  loose: 1.55, // descriptions
  spacious: 1.65, // body text
} as const;

export const letterSpacings = {
  tighter: "-0.045em", // hero heading
  tight: "-0.035em", // large headings
  snug: "-0.03em", // section headings
  normal: "-0.02em", // nav logo
  wide: "0.03em", // badge labels
  wider: "0.08em", // uppercase micro labels
  widest: "0.12em", // section labels
} as const;

// ─── SPACING & LAYOUT ────────────────────────────────────────

export const layout = {
  maxContent: 1060, // max width for two-column sections
  textWidth: 400, // text column width
  visualWidth: 460, // visual column width
  gap: 64, // gap between text and visual columns
  mobileBreakpoint: 820,
} as const;

export const spacing = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 14,
  "2xl": 16,
  "3xl": 18,
  "4xl": 20,
  "5xl": 24,
  "6xl": 28,
  "7xl": 32,
  "8xl": 40,
  "9xl": 60,
  "10xl": 80,
} as const;

// ─── BORDERS & RADII ────────────────────────────────────────

export const radii = {
  sm: 3,
  md: 4,
  base: 5,
  lg: 6,
  xl: 7,
  "2xl": 8,
  "3xl": 10,
  "4xl": 12,
  "5xl": 14,
  "6xl": 16,
  full: "50%",
  pill: 100,
} as const;

export const borders = {
  subtle: "1px solid #ffffff06",
  faint: "1px solid #ffffff08",
  dim: "1px solid #ffffff0A",
} as const;

// ─── SHADOWS ─────────────────────────────────────────────────

export const shadows = {
  card: "0 16px 50px #00000050",
  cardLight: "0 12px 40px #00000040",
  glow: (color: string) => `0 0 12px ${color}, 0 0 24px ${alpha(color, 0.38)}`,
  glowLg: (color: string) =>
    `0 0 16px ${color}, 0 0 40px ${alpha(color, 0.38)}`,
  button: (color: string) => `0 0 20px ${alpha(color, 0.19)}`,
  buttonHover: (color: string) => `0 0 30px ${alpha(color, 0.31)}`,
} as const;

// ─── TRANSITIONS ─────────────────────────────────────────────

export const transitions = {
  fast: "all 0.15s ease",
  normal: "all 0.3s ease",
  slow: "all 0.5s ease",
  reveal: "all 0.9s cubic-bezier(0.16,1,0.3,1)",
  revealLong: "all 1.1s cubic-bezier(0.16,1,0.3,1)",
  spring: "all 0.6s cubic-bezier(0.34,1.56,0.64,1)",
  easeOut: "cubic-bezier(0.16,1,0.3,1)",
} as const;

// ─── ANIMATION CONSTANTS ─────────────────────────────────────

export const animation = {
  // ScrollReveal
  revealThreshold: 0.75,
  revealRootMargin: "-120px 0px",
  revealDistance: 60, // px travel distance
  revealScale: 0.92, // scale-from value
  revealStagger: {
    label: 100,
    heading: 220,
    body: 360,
  },

  // Particles
  particleCount: 220,
  collisionRadius: 32,
  mouseAttractRadius: 350,
  mouseRepelRadius: 40,
  mouseAttractStrength: 0.18,
  mouseRepelStrength: 0.5,
  particleMaxSpeed: 1.8,
  particleDamping: 0.96,
  connectionDistance: 60,
} as const;

// ─── HEROUI THEME ───────────────────────────────────────────
// Derived from theme.config.json via lib/theme/resolve.
// hero.ts imports this — never duplicate color values there.

export const heroThemeColors = toHeroThemeColors(resolved);

// ─── CARD STYLES (common patterns) ──────────────────────────

export const cardStyles = {
  base: {
    background: colors.darkCard,
    borderRadius: radii["5xl"],
    border: borders.dim,
    boxShadow: shadows.card,
    fontFamily: fonts.sans,
  },
  visual: {
    background: "#0A0A14",
    borderRadius: radii["5xl"],
    border: borders.dim,
    boxShadow: shadows.card,
    fontFamily: fonts.sans,
  },
} as const;
