/**
 * Privy Wagmi Configuration
 *
 * Uses createConfig from @privy-io/wagmi (NOT from wagmi directly).
 * This wraps wagmi's config with Privy-specific behavior for embedded wallets.
 */

import { createConfig } from "@privy-io/wagmi";

import { supportedChains, transports } from "../../utils/wagmi-shared";

export const privyWagmiConfig = createConfig({
  chains: supportedChains,
  transports,
});
