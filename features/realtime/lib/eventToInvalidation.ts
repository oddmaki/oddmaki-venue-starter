/**
 * Event → Query Key Invalidation Mapping
 *
 * Maps each Diamond contract event name + decoded args to the TanStack Query
 * keys that should be invalidated. The debouncer batches these before flushing
 * to queryClient.invalidateQueries().
 */

import { queryKeys } from "@/lib/oddmaki/queryKeys";

type QueryKey = readonly unknown[];

export function eventToInvalidationKeys(
  eventName: string,
  args: Record<string, unknown>,
): QueryKey[] {
  const marketId = args.marketId as bigint | undefined;
  const marketIdStr = marketId?.toString();

  switch (eventName) {
    // ── Trading events (high frequency) ──────────────────────────────

    case "OrderPlaced":
    case "OrderCancelled":
    case "OrderExpired":
    case "OrderDeleted":
      return [queryKeys.orderbook.all, queryKeys.orders.all];

    case "TopOfBookChanged":
      return [queryKeys.orderbook.all];

    case "OrderFilled":
    case "TradeExecuted":
      return [
        queryKeys.orderbook.all,
        queryKeys.orders.all,
        queryKeys.positions.all,
        queryKeys.balance.all,
        ...(marketIdStr
          ? [queryKeys.trades.byMarket(marketIdStr)]
          : [queryKeys.trades.all]),
      ];

    case "MintFill":
    case "MergeFill":
      return [
        queryKeys.orderbook.all,
        queryKeys.orders.all,
        queryKeys.positions.all,
        queryKeys.balance.all,
      ];

    case "FeesDistributed":
      return [queryKeys.balance.all];

    case "MarketOrderExecuted":
      return [
        queryKeys.orderbook.all,
        queryKeys.orders.all,
        queryKeys.positions.all,
        queryKeys.balance.all,
        ...(marketIdStr
          ? [
              queryKeys.trades.byMarket(marketIdStr),
              queryKeys.markets.detail(marketIdStr),
            ]
          : [queryKeys.trades.all, queryKeys.markets.all]),
      ];

    // ── Market lifecycle ─────────────────────────────────────────────

    case "MarketCreated":
    case "MarketGroupCreated":
    case "MarketGroupActivated":
    case "MarketAddedToGroup":
    case "PlaceholderActivated":
    case "PlaceholderMarketsAdded":
      return [queryKeys.markets.all];

    case "MarketResolved":
      return [
        queryKeys.markets.all,
        queryKeys.positions.all,
        queryKeys.resolution.all,
      ];

    case "MarketGroupResolved":
      return [
        queryKeys.markets.all,
        queryKeys.positions.all,
        queryKeys.resolution.all,
      ];

    // ── Resolution lifecycle ─────────────────────────────────────────

    case "AssertionCreated":
    case "AssertionSettled":
    case "AssertionDisputed":
      return [queryKeys.markets.all, queryKeys.resolution.all];

    // ── Venue management ─────────────────────────────────────────────

    case "VenueCreated":
    case "VenueUpdated":
    case "VenueFeesUpdated":
    case "VenueOracleParamsUpdated":
    case "VenuePaused":
    case "VenueUnpaused":
      return [queryKeys.venue.all];

    case "VenueAccessControlUpdated":
      return [queryKeys.venue.all, queryKeys.accessControl.all];

    // ── Access control ───────────────────────────────────────────────

    case "AccessControlDeployed":
    case "MarketTradingAccessControlSet":
    case "MarketTradingAccessControlRemoved":
      return [queryKeys.accessControl.all];

    // ── Tags ─────────────────────────────────────────────────────────

    case "MarketTagsUpdated":
    case "MarketGroupTagsUpdated":
      return [queryKeys.markets.all];

    // ── Fee collection ───────────────────────────────────────────────

    case "MarketCreationFeeCollected":
      return [queryKeys.balance.all];

    // ── CTF events (from ConditionalTokens contract) ─────────────────

    case "PositionSplit":
    case "PositionsMerge":
      return [queryKeys.positions.all, queryKeys.balance.all];

    case "PayoutRedemption":
      return [queryKeys.positions.all, queryKeys.balance.all];

    default:
      return [];
  }
}
