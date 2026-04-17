'use client';

import { useState, useCallback } from 'react';
import { Card, CardHeader, CardBody } from '@heroui/card';
import { Chip } from '@heroui/chip';
import { Button } from '@heroui/button';
import { Skeleton } from '@heroui/skeleton';
import { useConnection, usePublicClient } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { useUserOrders } from '@/features/market-detail/hooks/useUserOrders';
import type { SubgraphOrder } from '@/features/market-detail/hooks/useUserOrders';
import { useOddMakiClient } from '@/lib/oddmaki/hooks';
import { useTransactionFlow } from '@/lib/oddmaki/useTransactionFlow';
import { TransactionFlowModal } from '@/lib/oddmaki/TransactionFlowModal';
import { queryKeys } from '@/lib/oddmaki/queryKeys';
import { RefreshButton } from '@/lib/oddmaki/RefreshButton';
import type { FlowStep } from '@/lib/oddmaki/useTransactionFlow';
import type { Address } from 'viem';

interface UserOrdersPanelProps {
  marketId: string;
  outcomes: string[];
  tickSize: string;
  isResolved?: boolean;
}

function tickToPrice(tick: string, tickSize: string): string {
  const t = parseFloat(tick);
  const ts = parseFloat(tickSize);
  if (t === 0 || ts === 0) return '0.00';
  const price = (t * ts) / 1e18;
  return price.toFixed(2);
}

function formatQty(qty: string): string {
  // Outcome tokens use the collateral decimals (USDC = 6)
  const num = parseFloat(qty) / 1e6;
  if (num === 0) return '0';
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  if (num < 0.01) return num.toFixed(4);
  return num.toFixed(2);
}

export function UserOrdersPanel({
  marketId,
  outcomes,
  tickSize,
  isResolved = false,
}: UserOrdersPanelProps) {
  const { data: orders, isLoading, isFetching, refetch } = useUserOrders(marketId);
  const { address } = useConnection();
  const client = useOddMakiClient();
  const publicClient = usePublicClient();
  const queryClient = useQueryClient();

  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [flowOpen, setFlowOpen] = useState(false);
  const [flowTitle, setFlowTitle] = useState('Cancel Order');

  const flow = useTransactionFlow({
    invalidateKeys: [
      queryKeys.orderbook.byMarket(BigInt(marketId), 0),
      queryKeys.orderbook.byMarket(BigInt(marketId), 1),
      queryKeys.markets.all,
      queryKeys.positions.all,
      queryKeys.balance.all,
    ],
  });

  const handleCancelAll = useCallback(
    async (orderIds: string[]) => {
      if (!publicClient || !address || orderIds.length === 0) return;
      setFlowTitle(`Cancel All Orders (${orderIds.length})`);
      setFlowOpen(true);

      const steps: FlowStep[] = [
        {
          id: 'batch-cancel',
          label: `Cancel ${orderIds.length} order${orderIds.length > 1 ? 's' : ''}`,
          execute: async () => {
            const ids = orderIds.map((id) => BigInt(id));
            const hash = isResolved
              ? await client.trade.cancelOrdersOnResolvedMarket(
                  BigInt(marketId),
                  ids,
                )
              : await client.trade.batchCancelOrders(ids);
            await publicClient.waitForTransactionReceipt({ hash });
          },
        },
      ];

      await flow.start(steps);
    },
    [client, publicClient, address, flow, isResolved, marketId],
  );

  const handleCancel = useCallback(
    async (orderId: string) => {
      if (!publicClient || !address) return;
      setCancellingOrderId(orderId);
      setFlowTitle(`Cancel Order #${orderId}`);
      setFlowOpen(true);

      const removeFromCache = () => {
        const qk = queryKeys.orders.byMarketUser(marketId, address as Address);
        queryClient.setQueryData<SubgraphOrder[]>(qk, (old) =>
          old ? old.filter((o) => o.orderId !== orderId) : [],
        );
      };

      const steps: FlowStep[] = [
        {
          id: 'cancel-order',
          label: `Cancel Order #${orderId}`,
          execute: async () => {
            try {
              const hash = await client.trade.cancelOrder(BigInt(orderId));
              await publicClient.waitForTransactionReceipt({ hash });
            } catch (err: any) {
              const msg = err?.message || err?.toString() || '';
              if (msg.includes('Order not found')) {
                // Order doesn't exist on-chain (stale subgraph data) — remove it
                removeFromCache();
                return; // Treat as success — the order is already gone
              }
              throw err;
            }
            removeFromCache();
          },
        },
      ];

      await flow.start(steps);
    },
    [client, publicClient, address, marketId, queryClient, flow],
  );

  const handleFlowClose = () => {
    setFlowOpen(false);
    setCancellingOrderId(null);
    flow.reset();
  };

  const activeOrders = (orders || []).filter(
    (o) => o.status === 'Active' || o.status === 'PartiallyFilled',
  );

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Your Orders</h2>
        <div className="flex items-center gap-2">
          {activeOrders.length >= (isResolved ? 1 : 2) && (
            <Button
              size="sm"
              color="danger"
              variant="flat"
              isDisabled={flow.isRunning}
              onPress={() => handleCancelAll(activeOrders.map((o) => o.orderId))}
            >
              {isResolved ? 'Cancel All Orders' : 'Cancel All'}
            </Button>
          )}
          <RefreshButton onRefresh={() => refetch()} isFetching={isFetching} />
        </div>
      </CardHeader>
      <CardBody>
        {isLoading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ) : activeOrders.length === 0 ? (
          <p className="text-sm text-default-400 text-center py-4">
            No active orders
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {/* Header — hidden on mobile (card layout takes over) */}
            <div className="hidden sm:grid grid-cols-5 gap-2 text-xs text-default-400 px-2">
              <span>Side</span>
              <span>Outcome</span>
              <span className="text-right">Price</span>
              <span className="text-right">Qty</span>
              <span className="text-right">Action</span>
            </div>

            <div className="flex flex-col gap-2 max-h-[440px] overflow-y-auto">
            {activeOrders.map((order) => {
              const orderId = order.orderId;
              const isBuy = order.side === 'BUY' || order.side === '0';
              const outcomeNum = parseInt(order.outcome);
              const outcomeName =
                outcomes[outcomeNum] || (outcomeNum === 0 ? 'Yes' : 'No');
              const price = tickToPrice(order.tick, tickSize);
              const remaining =
                BigInt(order.amount) - BigInt(order.filled);
              const qty = formatQty(remaining.toString());

              return (
                <div
                  key={order.id || orderId}
                  className="px-2 py-1.5 rounded-lg hover:bg-default-100"
                >
                  {/* Desktop: 5-col grid */}
                  <div className="hidden sm:grid grid-cols-5 gap-2 items-center">
                    <Chip
                      size="sm"
                      color={isBuy ? 'primary' : 'secondary'}
                      variant="flat"
                    >
                      {isBuy ? 'Buy' : 'Sell'}
                    </Chip>
                    <span className="text-sm">{outcomeName}</span>
                    <span className="text-sm text-right">${price}</span>
                    <span className="text-sm text-right">{qty}</span>
                    <div className="flex justify-end">
                      {!isResolved && (
                        <Button
                          size="sm"
                          color="danger"
                          variant="light"
                          isLoading={cancellingOrderId === orderId && flow.isRunning}
                          isDisabled={flow.isRunning}
                          onPress={() => handleCancel(orderId)}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Mobile: stacked card */}
                  <div className="sm:hidden flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Chip
                          size="sm"
                          color={isBuy ? 'primary' : 'secondary'}
                          variant="flat"
                        >
                          {isBuy ? 'Buy' : 'Sell'}
                        </Chip>
                        <span className="text-sm truncate">{outcomeName}</span>
                      </div>
                      {!isResolved && (
                        <Button
                          size="sm"
                          color="danger"
                          variant="light"
                          isLoading={cancellingOrderId === orderId && flow.isRunning}
                          isDisabled={flow.isRunning}
                          onPress={() => handleCancel(orderId)}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2 text-xs text-default-500">
                      <span>${price} × {qty}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        )}
      </CardBody>

      <TransactionFlowModal
        isOpen={flowOpen}
        onClose={handleFlowClose}
        title={flowTitle}
        stepStates={flow.stepStates}
        isRunning={flow.isRunning}
        isComplete={flow.isComplete}
        hasError={flow.hasError}
        onRetry={flow.retry}
      />
    </Card>
  );
}
