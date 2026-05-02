"use client";

/**
 * Deterministic avatar generator from Ethereum addresses.
 * Creates a unique gradient avatar based on the address bytes.
 * Same address always renders the same avatar. No dependencies needed.
 */

/**
 * Derive HSL colors deterministically from an address.
 * Uses different byte ranges for each color to maximize visual diversity.
 */
function deriveColors(address: string): [string, string, string] {
  const hex = address.replace("0x", "").toLowerCase();

  // Use different parts of the address for each color
  const h1 = parseInt(hex.slice(0, 4), 16) % 360;
  const h2 = parseInt(hex.slice(4, 8), 16) % 360;
  const h3 = parseInt(hex.slice(8, 12), 16) % 360;

  const s1 = 50 + (parseInt(hex.slice(12, 14), 16) % 30); // 50-80%
  const s2 = 50 + (parseInt(hex.slice(14, 16), 16) % 30);
  const s3 = 50 + (parseInt(hex.slice(16, 18), 16) % 30);

  const l1 = 40 + (parseInt(hex.slice(18, 20), 16) % 25); // 40-65%
  const l2 = 40 + (parseInt(hex.slice(20, 22), 16) % 25);
  const l3 = 40 + (parseInt(hex.slice(22, 24), 16) % 25);

  return [
    `hsl(${h1}, ${s1}%, ${l1}%)`,
    `hsl(${h2}, ${s2}%, ${l2}%)`,
    `hsl(${h3}, ${s3}%, ${l3}%)`,
  ];
}

/**
 * Derive gradient angle from address bytes.
 */
function deriveAngle(address: string): number {
  const hex = address.replace("0x", "").toLowerCase();

  return parseInt(hex.slice(24, 28), 16) % 360;
}

export interface AddressAvatarProps {
  address: string;
  size?: number;
  className?: string;
}

/**
 * Renders a deterministic gradient avatar for an Ethereum address.
 * The gradient colors and angle are derived from the address bytes.
 */
export function AddressAvatar({
  address,
  size = 40,
  className = "",
}: AddressAvatarProps) {
  const [c1, c2, c3] = deriveColors(address);
  const angle = deriveAngle(address);

  return (
    <div
      className={`rounded-full shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(${angle}deg, ${c1}, ${c2}, ${c3})`,
      }}
    />
  );
}

/**
 * Generate a gradient background style for use in custom elements.
 */
export function getAvatarGradient(address: string): string {
  const [c1, c2, c3] = deriveColors(address);
  const angle = deriveAngle(address);

  return `linear-gradient(${angle}deg, ${c1}, ${c2}, ${c3})`;
}
