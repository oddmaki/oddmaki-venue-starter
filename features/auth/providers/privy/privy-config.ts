/**
 * Privy Configuration
 *
 * Login methods, appearance, and chain config for the Privy provider.
 */

import type { PrivyClientConfig } from '@privy-io/react-auth';
import { ACTIVE_CHAIN } from '@/lib/oddmaki/chain';

export const privyConfig: PrivyClientConfig = {
  loginMethods: ['email', 'wallet', 'google', 'apple'],
  appearance: {
    theme: 'dark',
    accentColor: '#06b6d4', // cyan-500 to match venue-app theme
    showWalletLoginFirst: false,
  },
  embeddedWallets: {
    ethereum: {
      createOnLogin: 'users-without-wallets',
    },
  },
  supportedChains: [ACTIVE_CHAIN],
  defaultChain: ACTIVE_CHAIN,
};
