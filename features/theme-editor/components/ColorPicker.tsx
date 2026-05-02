"use client";

import { Input } from "@heroui/input";

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}

const HEX_REGEX = /^#[0-9A-Fa-f]{6}$/;

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  return (
    <div className="flex items-center gap-3">
      <input
        className="w-10 h-10 rounded-lg border border-default-200 cursor-pointer bg-transparent p-0.5"
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <Input
        className="flex-1"
        classNames={{ input: "font-mono text-xs uppercase" }}
        label={label}
        size="sm"
        value={value}
        onValueChange={(v) => {
          const hex = v.startsWith("#") ? v : `#${v}`;

          if (HEX_REGEX.test(hex)) {
            onChange(hex);
          }
        }}
      />
    </div>
  );
}
