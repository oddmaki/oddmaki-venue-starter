/**
 * OddMaki SDK React Hooks
 *
 * Wrapper hooks for the OddMaki Protocol SDK that integrate with Wagmi.
 */

'use client';

import { useMemo } from 'react';
import { useWalletClient } from 'wagmi';
import { createOddMakiClient } from '@oddmaki-protocol/sdk';
import { ACTIVE_CHAIN } from './chain';

/**
 * Hook to get an initialized OddMaki client
 *
 * @returns OddMaki client instance
 */
export function useOddMakiClient() {
  const { data: walletClient } = useWalletClient();

  return useMemo(() => {
    // The SDK creates its own public client internally
    // We just pass the wallet client (optional) and chain
    return createOddMakiClient({
      chain: ACTIVE_CHAIN,
      walletClient: walletClient as any, // Cast to any to avoid version mismatches
    });
  }, [walletClient]);
}
