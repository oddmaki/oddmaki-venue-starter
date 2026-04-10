'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Input } from '@heroui/input';
import { Button } from '@heroui/button';
import { Select, SelectItem } from '@heroui/select';
import { Divider } from '@heroui/divider';
import { useConnection } from 'wagmi';
import { useTokenBalance } from '@/features/wallet';
import { ChevronDownIcon } from '@/components/icons';

const AMOUNT_DELTAS = [1, 5, 10, 100];
import { usePlaceMarketOrder } from '../hooks/usePlaceMarketOrder';
import { useOrderbookLevels } from '@/features/orderbook/hooks/useOrderbookLevels';
import { TransactionFlowModal } from '@/lib/oddmaki/TransactionFlowModal';
import { useCanTradeOnMarket } from '@/features/access-control';

interface MarketOrderFormProps {
  marketId: string;
  outcomeIndex: 0 | 1;
  outcomeName: string;
  tickSize: string;
  side?: 'BUY' | 'SELL';
}

const DEFAULT_SLIPPAGE_PCT = 5;

const ORDER_TYPE_OPTIONS = [
  { key: 'FAK', label: 'Fill & Kill (partial fill OK)' },
  { key: 'FOK', label: 'Fill or Kill (all or nothing)' },
];

function computeMaxPrice(bestAsk: string, slippagePct: number): string {
  const price = parseFloat(bestAsk);
  if (isNaN(price) || price <= 0) return '0.99';
  const withSlippage = price * (1 + slippagePct / 100);
  return Math.min(withSlippage, 1.0).toFixed(2);
}

function computeMinPrice(bestBid: string, slippagePct: number): string {
  const price = parseFloat(bestBid);
  if (isNaN(price) || price <= 0) return '0.01';
  const withSlippage = price * (1 - slippagePct / 100);
  return Math.max(withSlippage, 0.01).toFixed(2);
}

export function MarketOrderForm({
  marketId,
  outcomeIndex,
  outcomeName,
  tickSize,
  side = 'BUY',
}: MarketOrderFormProps) {
  const isBuy = side === 'BUY';
  const sideLabel = isBuy ? 'Buy' : 'Sell';
  const sideColor = isBuy ? 'primary' : 'secondary';
  const { isConnected } = useConnection();
  const { startPlaceMarketOrder, flow } = usePlaceMarketOrder();
  const { data: canTrade = true } = useCanTradeOnMarket(
    marketId ? BigInt(marketId) : undefined,
  );
  const { data: orderbook } = useOrderbookLevels(marketId, outcomeIndex, tickSize);

  const bestAskPrice = orderbook?.bestAskPrice ?? null;
  const bestBidPrice = orderbook?.bestBidPrice ?? null;
  const referencePrice = isBuy ? bestAskPrice : bestBidPrice;
  const hasMatchingOrders = orderbook
    ? isBuy
      ? orderbook.asks.length > 0
      : orderbook.bids.length > 0
    : true; // assume yes while loading

  const { formatted: walletBalance } = useTokenBalance();
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState(isBuy ? '0.99' : '0.01');
  const [orderType, setOrderType] = useState<'FOK' | 'FAK'>('FAK');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [flowOpen, setFlowOpen] = useState(false);

  // Track whether the user has manually edited the price
  const userEditedRef = useRef(false);
  const prevKeyRef = useRef('');

  // Auto-set price from best ask/bid + slippage when orderbook data arrives
  useEffect(() => {
    const key = `${outcomeIndex}-${side}-${referencePrice}`;
    if (key === prevKeyRef.current) return;
    prevKeyRef.current = key;

    if (referencePrice && !userEditedRef.current) {
      setPrice(
        isBuy
          ? computeMaxPrice(referencePrice, DEFAULT_SLIPPAGE_PCT)
          : computeMinPrice(referencePrice, DEFAULT_SLIPPAGE_PCT),
      );
    }
  }, [referencePrice, outcomeIndex, side, isBuy]);

  // Reset manual-edit flag when outcome or side changes
  useEffect(() => {
    userEditedRef.current = false;
  }, [outcomeIndex, side]);

  const handlePriceChange = (v: string) => {
    userEditedRef.current = true;
    setPrice(v);
  };

  const isValid = (() => {
    const a = parseFloat(amount);
    const p = parseFloat(price);
    return !isNaN(a) && a > 0 && !isNaN(p) && p > 0 && p <= 1;
  })();

  // Estimated shares (to win) for buy orders: amount / reference price
  const estimatedShares = useMemo(() => {
    const a = parseFloat(amount);
    const ref = referencePrice ? parseFloat(referencePrice) : null;
    if (!a || !ref || ref <= 0) return null;
    return (a / ref).toFixed(2);
  }, [amount, referencePrice]);

  const handleSubmit = async () => {
    if (!isValid) return;
    setFlowOpen(true);
    await startPlaceMarketOrder({
      marketId,
      outcomeIndex,
      side,
      amount,
      maxPrice: price,
      orderType,
    });
  };

  const handleFlowClose = () => {
    if (flow.isComplete) {
      setAmount('');
    }
    setFlowOpen(false);
    flow.reset();
  };

  const priceLabel = isBuy ? 'Max Price' : 'Min Price';
  const priceDescription = referencePrice
    ? isBuy
      ? `Best ask: $${referencePrice} (+${DEFAULT_SLIPPAGE_PCT}% slippage)`
      : `Best bid: $${referencePrice} (-${DEFAULT_SLIPPAGE_PCT}% slippage)`
    : isBuy
      ? 'Slippage protection — no asks in orderbook'
      : 'Slippage protection — no bids in orderbook';

  const noOrdersMessage = isBuy
    ? 'No sell orders in the orderbook to fill against. Place a limit order instead.'
    : 'No buy orders in the orderbook to fill against. Place a limit order instead.';

  return (
    <div className="flex flex-col gap-3">
      {/* Amount — compact row: label left, input right */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-default-500">Amount</span>
        <div className="flex items-center gap-1">
          <span className="text-lg font-semibold text-foreground">$</span>
          <input
            type="number"
            step="1"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="w-20 text-right bg-transparent text-lg font-semibold text-foreground outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
      </div>

      {/* Quick-add chips with container background */}
      <div className="flex gap-1 rounded-lg p-1.5">
        {AMOUNT_DELTAS.map((d) => (
          <Button
            key={d}
            size="sm"
            variant="flat"
            className="min-w-0 h-6 px-2 bg-default-100 text-xs flex-1"
            onPress={() => {
              const current = parseFloat(amount) || 0;
              setAmount(String(current + d));
            }}
          >
            +${d}
          </Button>
        ))}
        <Button
          size="sm"
          variant="flat"
          className="min-w-0 h-6 px-2 bg-default-100 text-xs flex-1"
          isDisabled={!isConnected}
          onPress={() => setAmount(walletBalance)}
        >
          Max
        </Button>
      </div>

      {/* To Win summary */}
      {amount && parseFloat(amount) > 0 && (
        <>
          <Divider />
          <div className="flex flex-col gap-1 px-1">
            {isBuy && estimatedShares && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-default-400">
                    To win
                  </span>
                  <span className="font-semibold text-success">
                    ${estimatedShares}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-default-400">
                    Avg. Price {referencePrice ? `${Math.round(parseFloat(referencePrice) * 100)}¢` : ''}
                  </span>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* Collapsible advanced fields */}
      <button
        className="flex items-center gap-1 text-xs text-default-400 hover:text-default-600 transition-colors"
        onClick={() => setShowAdvanced(!showAdvanced)}
      >
        <span>Advanced</span>
        <ChevronDownIcon
          size={12}
          className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
        />
      </button>

      {showAdvanced && (
        <div className="flex flex-col gap-3">
          <Input
            label={priceLabel}
            placeholder="0.01 — 1.00"
            type="number"
            step="0.01"
            min="0.01"
            max="1.00"
            value={price}
            onValueChange={handlePriceChange}
            description={priceDescription}
            size="sm"
          />

          <Select
            label="Order Type"
            selectedKeys={[orderType]}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0] as string;
              if (selected === 'FOK' || selected === 'FAK') {
                setOrderType(selected);
              }
            }}
            size="sm"
          >
            {ORDER_TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.key}>{opt.label}</SelectItem>
            ))}
          </Select>
        </div>
      )}

      <Button
        color={sideColor as 'primary' | 'secondary'}
        isDisabled={!isConnected || !isValid || !canTrade || !hasMatchingOrders}
        isLoading={flow.isRunning}
        onPress={handleSubmit}
        className="w-full"
      >
        {!isConnected
          ? 'Connect Wallet'
          : !canTrade
            ? 'Access Restricted'
            : !hasMatchingOrders
              ? 'No Orders Available'
              : 'Trade'}
      </Button>

      {!hasMatchingOrders && (
        <p className="text-xs text-default-400 text-center">
          {noOrdersMessage}
        </p>
      )}

      <TransactionFlowModal
        isOpen={flowOpen}
        onClose={handleFlowClose}
        title={`${sideLabel} ${outcomeName}`}
        stepStates={flow.stepStates}
        isRunning={flow.isRunning}
        isComplete={flow.isComplete}
        hasError={flow.hasError}
        onRetry={flow.retry}
      />
    </div>
  );
}
