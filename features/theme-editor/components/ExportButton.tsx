"use client";

import type { ThemeConfig } from "@/lib/theme";

import { Button } from "@heroui/button";

interface ExportButtonProps {
  config: ThemeConfig;
}

export function ExportButton({ config }: ExportButtonProps) {
  const handleExport = () => {
    const json = JSON.stringify(config, null, 2) + "\n";
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "theme.config.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button className="w-full" color="primary" onPress={handleExport}>
      Export theme.config.json
    </Button>
  );
}
