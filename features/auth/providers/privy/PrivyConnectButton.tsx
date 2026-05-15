"use client";

import type { ConnectButtonProps } from "../../types";

import React from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useAccount } from "wagmi";
import { Button } from "@heroui/button";

import { UserSettings } from "../../components/UserSettings";

export function PrivyConnectButton(_props: ConnectButtonProps) {
  const { ready, authenticated, login, logout } = usePrivy();
  const { address } = useAccount();

  if (!ready) {
    return (
      <Button isDisabled isLoading size="sm">
        Loading...
      </Button>
    );
  }

  if (!authenticated || !address) {
    return (
      <Button color="primary" size="sm" variant="flat" onPress={() => login()}>
        Connect
      </Button>
    );
  }

  return <UserSettings address={address} disconnect={logout} />;
}
