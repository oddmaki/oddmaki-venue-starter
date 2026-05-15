/**
 * RainbowKit Wagmi Configuration
 *
 * Uses RainbowKit's `getDefaultConfig` so WalletConnect (mobile wallets)
 * is wired up alongside the injected/Coinbase connectors. Requires
 * `NEXT_PUBLIC_WALLETCONNECT_ID` — create one at https://cloud.reown.com.
 */

import { getDefaultConfig } from "@rainbow-me/rainbowkit";

import { supportedChains, transports } from "../../utils/wagmi-shared";

import { venueConfig } from "@/config/venue.config";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_ID;

if (!projectId) {
  throw new Error(
    "NEXT_PUBLIC_WALLETCONNECT_ID is not set. Get a free project ID at https://cloud.reown.com and add it to .env.local, or switch NEXT_PUBLIC_AUTH_PROVIDER to 'privy'.",
  );
}

export const rainbowkitWagmiConfig = getDefaultConfig({
  appName: venueConfig.branding.name,
  projectId,
  chains: supportedChains,
  transports,
  ssr: true,
});
