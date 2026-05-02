import type { ColorScale } from "./types";

// ─── HEX ↔ HSL CONVERSIONS ──────────────────────────────────

/** Parse hex (#RRGGBB or #RGB) to [h, s, l] where h=0-360, s=0-100, l=0-100 */
export function hexToHsl(hex: string): [number, number, number] {
  const raw = hex.replace("#", "");
  const full =
    raw.length === 3
      ? raw[0] + raw[0] + raw[1] + raw[1] + raw[2] + raw[2]
      : raw;

  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) return [0, 0, Math.round(l * 100)];

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h = 0;

  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

/** Convert HSL to hex string */
export function hslToHex(h: number, s: number, l: number): string {
  const sN = s / 100;
  const lN = l / 100;

  const c = (1 - Math.abs(2 * lN - 1)) * sN;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lN - c / 2;

  let r = 0,
    g = 0,
    b = 0;

  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  const toHex = (n: number) =>
    Math.round((n + m) * 255)
      .toString(16)
      .padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/** Format HSL as HeroUI CSS variable value: "186 100% 50%" */
export function hslToHeroUiValue(h: number, s: number, l: number): string {
  return `${h} ${s}% ${l}%`;
}

// ─── LUMINANCE & CONTRAST ───────────────────────────────────

/** Calculate relative luminance (0-1) for a hex color */
export function relativeLuminance(hex: string): number {
  const raw = hex.replace("#", "");
  const full =
    raw.length === 3
      ? raw[0] + raw[0] + raw[1] + raw[1] + raw[2] + raw[2]
      : raw;

  const linearize = (c: number) => {
    const srgb = c / 255;

    return srgb <= 0.03928
      ? srgb / 12.92
      : Math.pow((srgb + 0.055) / 1.055, 2.4);
  };

  const r = linearize(parseInt(full.slice(0, 2), 16));
  const g = linearize(parseInt(full.slice(2, 4), 16));
  const b = linearize(parseInt(full.slice(4, 6), 16));

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Pick foreground color for readability. Returns dark for bright colors, light for dark. */
export function autoForeground(
  bgHex: string,
  darkFg: string,
  lightFg: string,
): string {
  return relativeLuminance(bgHex) > 0.35 ? darkFg : lightFg;
}

// ─── SHADE SCALE GENERATION ─────────────────────────────────

/** Linearly interpolate between two values */
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Clamp a value between min and max */
function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/** Lighten a hex color by a 0-1 amount (in lightness space) */
export function lighten(hex: string, amount: number): string {
  const [h, s, l] = hexToHsl(hex);

  return hslToHex(h, s, clamp(l + amount * 100, 0, 100));
}

/**
 * Generate a full shade scale for dark theme.
 * Input hex becomes the 500/DEFAULT shade.
 * 50 = darkest, 900 = lightest.
 */
export function generateColorScale(hex: string, darkBg: string): ColorScale {
  const [h, s, l] = hexToHsl(hex);
  const [, , bgL] = hexToHsl(darkBg);

  // Dark end: between background lightness+2 and input lightness
  const darkL = clamp(bgL + 2, 3, 15);
  // Light end: high lightness pastels
  const lightL = clamp(l + (100 - l) * 0.7, 80, 95);

  // Saturation adjustments: reduce at extremes
  const darkS = Math.round(s * 0.4);
  const lightS = Math.round(s * 0.5);

  const shadeSpec: [number, number, number][] = [
    [darkL, darkS, 0], // 50
    [lerp(darkL, l, 0.15), lerp(darkS, s, 0.3), 0], // 100
    [lerp(darkL, l, 0.35), lerp(darkS, s, 0.55), 0], // 200
    [lerp(darkL, l, 0.55), lerp(darkS, s, 0.75), 0], // 300
    [lerp(darkL, l, 0.8), lerp(darkS, s, 0.9), 0], // 400
    [l, s, 0], // 500 = input
    [lerp(l, lightL, 0.25), lerp(s, lightS, 0.2), 0], // 600
    [lerp(l, lightL, 0.5), lerp(s, lightS, 0.4), 0], // 700
    [lerp(l, lightL, 0.75), lerp(s, lightS, 0.65), 0], // 800
    [lightL, lightS, 0], // 900
  ];

  const shadeKeys = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;
  const scale = {} as Record<string, string>;

  for (let i = 0; i < shadeKeys.length; i++) {
    const [sL, sS] = shadeSpec[i];

    scale[String(shadeKeys[i])] = hslToHex(h, Math.round(sS), Math.round(sL));
  }

  scale["DEFAULT"] = hex;
  scale["foreground"] = autoForeground(hex, darkBg, "#FFFFFF");

  return scale as unknown as ColorScale;
}

/**
 * Generate the neutral `default` scale from card/surface colors.
 * Used for borders, muted text, and default component styling.
 */
export function generateDefaultScale(
  cardHex: string,
  fgHex: string,
): ColorScale {
  const [h] = hexToHsl(cardHex);
  // Build a gray scale with the card's hue for subtle tinting
  const shades: Record<string, string> = {
    "50": cardHex,
    "100": hslToHex(h, 8, 11),
    "200": hslToHex(h, 7, 16),
    "300": hslToHex(h, 5, 27),
    "400": hslToHex(h, 4, 33),
    "500": hslToHex(h, 3, 40),
    "600": hslToHex(h, 2, 53),
    "700": hslToHex(h, 1, 67),
    "800": hslToHex(h, 1, 80),
    "900": hslToHex(h, 0, 93),
    DEFAULT: cardHex,
    foreground: fgHex,
  };

  return shades as unknown as ColorScale;
}
