/**
 * RainbowKit Wagmi Configuration
 *
 * With `NEXT_PUBLIC_WALLETCONNECT_ID` set, uses RainbowKit's
 * `getDefaultConfig` to wire up the full connector suite — including
 * WalletConnect, which is what lets mobile wallets connect via QR.
 *
 * Without it, falls back to wagmi's injected-connector default so the
 * starter boots out of the box (browser-extension wallets only — no
 * mobile). Get a free project ID at https://cloud.reown.com to enable
 * mobile support.
 */

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { createConfig } from "wagmi";

import { supportedChains, transports } from "../../utils/wagmi-shared";

import { venueConfig } from "@/config/venue.config";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_ID;

export const rainbowkitWagmiConfig = projectId
  ? getDefaultConfig({
      appName: venueConfig.branding.name,
      projectId,
      chains: supportedChains,
      transports,
      ssr: true,
    })
  : createConfig({
      chains: supportedChains,
      transports,
      ssr: true,
    });
