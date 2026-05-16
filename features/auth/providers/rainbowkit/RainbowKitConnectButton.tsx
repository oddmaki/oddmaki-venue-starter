"use client";

import type { ConnectButtonProps } from "../../types";

import React from "react";
import { ConnectButton as RKConnectButton } from "@rainbow-me/rainbowkit";
import { useDisconnect } from "wagmi";
import { Button } from "@heroui/button";

import { UserSettings } from "../../components/UserSettings";

export function RainbowKitConnectButton(_props: ConnectButtonProps) {
  const { disconnect } = useDisconnect();

  return (
    <RKConnectButton.Custom>
      {({ account, chain, openChainModal, openConnectModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none" as const,
                userSelect: "none" as const,
              },
            })}
          >
            {!connected ? (
              <Button
                className="sm:h-10 sm:text-sm px-3 sm:px-4 min-w-0 font-semibold"
                color="primary"
                size="sm"
                onPress={openConnectModal}
              >
                Connect
              </Button>
            ) : chain.unsupported ? (
              <Button
                color="danger"
                size="sm"
                variant="flat"
                onPress={openChainModal}
              >
                Wrong Network
              </Button>
            ) : (
              <UserSettings
                address={account.address}
                disconnect={disconnect}
                switchNetwork={openChainModal}
              />
            )}
          </div>
        );
      }}
    </RKConnectButton.Custom>
  );
}
