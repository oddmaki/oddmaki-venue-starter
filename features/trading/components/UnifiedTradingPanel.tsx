'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardHeader, CardBody } from '@heroui/card';
import { Button } from '@heroui/button';
import { LimitOrderForm } from './LimitOrderForm';
import { MarketOrderForm } from './MarketOrderForm';
import { TradingModeDropdown } from './TradingModeDropdown';
import { SplitModal } from './SplitModal';
import { MergeModal } from './MergeModal';
import { useOrderbookLevels } from '@/features/orderbook/hooks/useOrderbookLevels';

interface UnifiedTradingPanelProps {
  marketId: string;
  outcomes: string[];
  tickSize: string;
}

export function UnifiedTradingPanel({
  marketId,
  outcomes,
  tickSize,
}: UnifiedTradingPanelProps) {
  const [mode, setMode] = useState<'market' | 'limit'>('limit');
  const [outcomeIndex, setOutcomeIndex] = useState<0 | 1>(0);
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [prefillPrice, setPrefillPrice] = useState<string | undefined>();
  const [splitModalOpen, setSplitModalOpen] = useState(false);
  const [mergeModalOpen, setMergeModalOpen] = useState(false);

  // Default to Market mode if orderbook has orders, otherwise Limit
  const { data: orderbook } = useOrderbookLevels(marketId, outcomeIndex, tickSize);
  const hasSetDefaultRef = useRef(false);

  useEffect(() => {
    if (orderbook && !hasSetDefaultRef.current) {
      hasSetDefaultRef.current = true;
      const hasOrders = orderbook.bids.length > 0 || orderbook.asks.length > 0;
      setMode(hasOrders ? 'market' : 'limit');
    }
  }, [orderbook]);

  const outcomeName =
    outcomes[outcomeIndex] || (outcomeIndex === 0 ? 'Yes' : 'No');

  /** Called from parent (OrderbookPanel) to prefill a price */
  const handlePriceClick = useCallback((price: string) => {
    setPrefillPrice(price);
    setMode('limit');
  }, []);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-3 pb-0">
          {/* Row 1: Buy/Sell toggle (left) + Mode dropdown (right) */}
          <div className="flex justify-between items-center w-full">
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={side === 'BUY' ? 'solid' : 'bordered'}
                color={side === 'BUY' ? 'primary' : 'default'}
                onPress={() => setSide('BUY')}
                className="min-w-16"
              >
                Buy
              </Button>
              <Button
                size="sm"
                variant={side === 'SELL' ? 'solid' : 'bordered'}
                color={side === 'SELL' ? 'secondary' : 'default'}
                onPress={() => setSide('SELL')}
                className="min-w-16"
              >
                Sell
              </Button>
            </div>

            <TradingModeDropdown
              mode={mode}
              onModeChange={setMode}
              onSplitOpen={() => setSplitModalOpen(true)}
              onMergeOpen={() => setMergeModalOpen(true)}
            />
          </div>

          {/* Row 2: Outcome selector */}
          <div className="flex gap-1 w-full">
            <Button
              size="sm"
              variant={outcomeIndex === 0 ? 'solid' : 'flat'}
              color={outcomeIndex === 0 ? 'primary' : 'default'}
              onPress={() => setOutcomeIndex(0)}
              className="flex-1"
            >
              {outcomes[0] || 'Yes'}
            </Button>
            <Button
              size="sm"
              variant={outcomeIndex === 1 ? 'solid' : 'flat'}
              color={outcomeIndex === 1 ? 'secondary' : 'default'}
              onPress={() => setOutcomeIndex(1)}
              className="flex-1"
            >
              {outcomes[1] || 'No'}
            </Button>
          </div>
        </CardHeader>

        <CardBody>
          {mode === 'market' ? (
            <MarketOrderForm
              marketId={marketId}
              outcomeIndex={outcomeIndex}
              outcomeName={outcomeName}
              tickSize={tickSize}
              side={side}
            />
          ) : (
            <LimitOrderForm
              marketId={marketId}
              outcomeIndex={outcomeIndex}
              outcomeName={outcomeName}
              side={side}
              prefillPrice={prefillPrice}
            />
          )}
        </CardBody>
      </Card>

      <SplitModal
        isOpen={splitModalOpen}
        onClose={() => setSplitModalOpen(false)}
        marketId={marketId}
        outcomes={outcomes}
      />
      <MergeModal
        isOpen={mergeModalOpen}
        onClose={() => setMergeModalOpen(false)}
        marketId={marketId}
        outcomes={outcomes}
      />
    </>
  );
}
