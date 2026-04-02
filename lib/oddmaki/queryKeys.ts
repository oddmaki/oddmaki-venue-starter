/**
 * Central Query Key Factory
 *
 * All TanStack Query keys used in the app. Centralizing them ensures
 * consistent cache invalidation across features.
 */

import type { Address } from 'viem';

export const queryKeys = {
  markets: {
    all: ['markets'] as const,
    list: (venueId?: string) => ['markets', 'list', venueId] as const,
    detail: (marketId: string) => ['markets', 'detail', marketId] as const,
    registry: (marketId: bigint) => ['markets', 'registry', marketId.toString()] as const,
    trading: (marketId: bigint) => ['markets', 'trading', marketId.toString()] as const,
    oracle: (marketId: bigint) => ['markets', 'oracle', marketId.toString()] as const,
  },

  orderbook: {
    all: ['orderbook'] as const,
    byMarket: (marketId: bigint, outcomeIndex: number) =>
      ['orderbook', marketId.toString(), outcomeIndex] as const,
    topOfBook: (marketId: string) => ['orderbook', 'top', marketId] as const,
    matchPreview: (marketId: string) => ['orderbook', 'matchPreview', marketId] as const,
  },

  positions: {
    all: ['positions'] as const,
    byMarketUser: (marketId: bigint, user: Address) =>
      ['positions', marketId.toString(), user] as const,
  },

  orders: {
    all: ['orders'] as const,
    byMarketUser: (marketId: string, user: Address) =>
      ['orders', marketId, user] as const,
    byMarket: (marketId: string) => ['orders', marketId] as const,
  },

  trades: {
    all: ['trades'] as const,
    byMarket: (marketId: string) => ['trades', marketId] as const,
    chart: (marketId: string, timeframe: string) =>
      ['trades', 'chart', marketId, timeframe] as const,
  },

  balance: {
    all: ['balance'] as const,
    usdc: (user: Address) => ['balance', 'usdc', user] as const,
  },

  approval: {
    erc20: (token: Address, owner: Address, spender: Address) =>
      ['approval', 'erc20', token, owner, spender] as const,
    ctf: (owner: Address, operator: Address) =>
      ['approval', 'ctf', owner, operator] as const,
  },

  resolution: {
    all: ['resolution'] as const,
    status: (marketId: bigint) => ['resolution', 'status', marketId.toString()] as const,
    assertion: (marketId: bigint) => ['resolution', 'assertion', marketId.toString()] as const,
  },

  priceMarket: {
    all: ['priceMarket'] as const,
    detail: (marketId: bigint) => ['priceMarket', 'detail', marketId.toString()] as const,
  },

  venue: {
    all: ['venue'] as const,
    list: () => ['venue', 'list'] as const,
    detail: (venueId: string) => ['venue', 'detail', venueId] as const,
    exists: (venueId: string) => ['venue', 'exists', venueId] as const,
  },

  marketGroups: {
    all: ['marketGroups'] as const,
    list: (venueId?: string) => ['marketGroups', 'list', venueId] as const,
    detail: (groupId: string) => ['marketGroups', 'detail', groupId] as const,
    markets: (groupId: string) => ['marketGroups', 'markets', groupId] as const,
  },

  unifiedFeed: {
    all: ['unifiedFeed'] as const,
    list: (venueId?: string, sortBy?: string) =>
      ['unifiedFeed', venueId, sortBy] as const,
  },

  accessControl: {
    all: ['accessControl'] as const,
    canTrade: (marketId: string, user: string) =>
      ['accessControl', 'canTrade', marketId, user] as const,
    canCreate: (venueId: string, user: string) =>
      ['accessControl', 'canCreate', venueId, user] as const,
    whitelistOwner: (acContract: string) =>
      ['accessControl', 'whitelistOwner', acContract] as const,
    marketTradingAC: (marketId: string) =>
      ['accessControl', 'marketTradingAC', marketId] as const,
  },

  trader: {
    all: ['trader'] as const,
    profile: (address: string) => ['trader', 'profile', address] as const,
    positions: (address: string) => ['trader', 'positions', address] as const,
    closedPositions: (address: string) => ['trader', 'closedPositions', address] as const,
    trades: (address: string) => ['trader', 'trades', address] as const,
  },

  leaderboard: {
    all: ['leaderboard'] as const,
    global: (sortBy: string) => ['leaderboard', 'global', sortBy] as const,
  },

  marketHolders: {
    all: ['marketHolders'] as const,
    top: (marketId: string) => ['marketHolders', 'top', marketId] as const,
  },

  pyth: {
    all: ['pyth'] as const,
    feeds: () => ['pyth', 'feeds'] as const,
    livePrice: (feedId: string) => ['pyth', 'livePrice', feedId] as const,
  },
} as const;
