/**
 * RainbowKit Wagmi Configuration
 *
 * Standalone wagmi config for the RainbowKit auth provider.
 * RainbowKit injects its own connectors via the provider.
 */

import { createConfig } from "wagmi";

import { supportedChains, transports } from "../../utils/wagmi-shared";

export const rainbowkitWagmiConfig = createConfig({
  chains: supportedChains,
  transports,
});
