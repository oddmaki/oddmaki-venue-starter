"use client";

import type { ThemeConfig } from "@/lib/theme";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";

import { useThemeOverride } from "../hooks/useThemeOverride";
import themeConfig from "../../../theme.config.json";

import { ColorPicker } from "./ColorPicker";
import { ThemePreviewPanel } from "./ThemePreviewPanel";
import { ExportButton } from "./ExportButton";

/** Build a full ThemeConfig from the editor's state */
function buildConfig(state: EditorState): ThemeConfig {
  const config: ThemeConfig = {
    brand: {
      primary: state.primary,
      secondary: state.secondary,
    },
  };

  if (state.background !== "#06060F") {
    config.surfaces = { background: state.background };
  }

  if (
    state.success !== "#00E68C" ||
    state.warning !== "#FFB800" ||
    state.danger !== "#FF6B6B"
  ) {
    config.semantic = {};
    if (state.success !== "#00E68C") config.semantic.success = state.success;
    if (state.warning !== "#FFB800") config.semantic.warning = state.warning;
    if (state.danger !== "#FF6B6B") config.semantic.danger = state.danger;
  }

  return config;
}

interface EditorState {
  primary: string;
  secondary: string;
  background: string;
  success: string;
  warning: string;
  danger: string;
}

const DEFAULTS: EditorState = {
  primary: themeConfig.brand.primary,
  secondary: themeConfig.brand.secondary,
  background: "#06060F",
  success: "#00E68C",
  warning: "#FFB800",
  danger: "#FF6B6B",
};

export function ThemeEditorPage() {
  const { setOverrides, clearOverrides } = useThemeOverride();
  const [state, setState] = useState<EditorState>(DEFAULTS);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Apply overrides as the user edits
  useEffect(() => {
    const config = buildConfig(state);

    setOverrides(config);

    return () => {
      clearOverrides();
    };
  }, [state, setOverrides, clearOverrides]);

  const update = (key: keyof EditorState) => (value: string) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setState(DEFAULTS);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Controls */}
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Theme Editor</h2>
          </CardHeader>
          <CardBody className="gap-4">
            <p className="text-sm text-default-400">
              Customize your venue&apos;s brand colors. Changes preview
              instantly. When done, export the config and drop it into your
              project.
            </p>

            <Divider />

            {/* Brand colors */}
            <p className="text-xs text-default-500 uppercase tracking-wider font-semibold">
              Brand Colors
            </p>
            <ColorPicker
              label="Primary"
              value={state.primary}
              onChange={update("primary")}
            />
            <ColorPicker
              label="Secondary"
              value={state.secondary}
              onChange={update("secondary")}
            />

            <Divider />

            {/* Surface */}
            <p className="text-xs text-default-500 uppercase tracking-wider font-semibold">
              Background
            </p>
            <ColorPicker
              label="Background"
              value={state.background}
              onChange={update("background")}
            />

            {/* Advanced toggle */}
            <Button
              className="self-start"
              size="sm"
              variant="light"
              onPress={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? "Hide" : "Show"} semantic colors
            </Button>

            {showAdvanced && (
              <>
                <Divider />
                <p className="text-xs text-default-500 uppercase tracking-wider font-semibold">
                  Semantic Colors
                </p>
                <ColorPicker
                  label="Success"
                  value={state.success}
                  onChange={update("success")}
                />
                <ColorPicker
                  label="Warning"
                  value={state.warning}
                  onChange={update("warning")}
                />
                <ColorPicker
                  label="Danger"
                  value={state.danger}
                  onChange={update("danger")}
                />
              </>
            )}

            <Divider />

            {/* Actions */}
            <div className="flex gap-2">
              <ExportButton config={buildConfig(state)} />
              <Button
                className="flex-shrink-0"
                variant="flat"
                onPress={handleReset}
              >
                Reset
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Right: Preview */}
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Live Preview</h2>
          </CardHeader>
          <CardBody>
            <ThemePreviewPanel />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
