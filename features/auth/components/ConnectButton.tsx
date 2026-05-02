"use client";

import type { ConnectButtonProps } from "../types";

import React from "react";
import dynamic from "next/dynamic";

import { authConfig } from "../config";

const RainbowKitConnectButton = dynamic(
  () =>
    import("../providers/rainbowkit/RainbowKitConnectButton").then(
      (mod) => mod.RainbowKitConnectButton,
    ),
  { ssr: false },
);

const PrivyConnectButton = dynamic(
  () =>
    import("../providers/privy/PrivyConnectButton").then(
      (mod) => mod.PrivyConnectButton,
    ),
  { ssr: false },
);

export function ConnectButton(props: ConnectButtonProps) {
  const Button =
    authConfig.provider === "privy"
      ? PrivyConnectButton
      : RainbowKitConnectButton;

  return <Button {...props} />;
}
