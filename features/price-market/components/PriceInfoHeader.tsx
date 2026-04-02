'use client';

import { Skeleton } from '@heroui/skeleton';
import { formatDollarPrice } from '../lib/format';

interface PriceInfoHeaderProps {
  /** Formatted strike price string (e.g., "67,011.92") */
  strikePrice: string;
  /** Live price from Pyth (numeric) */
  currentPrice?: number;
  /** Whether the live price is still loading */
  isLoading: boolean;
  /** Direction of current price vs strike */
  priceDirection: 'up' | 'down' | null;
  /** e.g., "BTC/USD" */
  feedSymbol?: string;
}

export function PriceInfoHeader({
  strikePrice,
  currentPrice,
  isLoading,
  priceDirection,
}: PriceInfoHeaderProps) {
  return (
    <div className="flex items-start gap-6">
      {/* Price to Beat */}
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] text-default-400 uppercase tracking-wider">
          Price To Beat
        </span>
        <span className="font-mono text-xl font-bold text-default-700">
          ${strikePrice}
        </span>
      </div>

      {/* Current Price */}
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-default-400 uppercase tracking-wider">
            Current Price
          </span>
          {priceDirection && (
            <span
              className={`text-[10px] font-semibold ${
                priceDirection === 'up' ? 'text-success' : 'text-danger'
              }`}
            >
              {priceDirection === 'up' ? '\u25B2' : '\u25BC'}{' '}
              ${currentPrice !== undefined ? formatDollarPrice(currentPrice) : ''}
            </span>
          )}
        </div>
        {isLoading ? (
          <Skeleton className="h-7 w-32 rounded" />
        ) : currentPrice !== undefined ? (
          <span
            className={`font-mono text-xl font-bold ${
              priceDirection === 'up'
                ? 'text-success'
                : priceDirection === 'down'
                  ? 'text-danger'
                  : 'text-default-700'
            }`}
          >
            ${formatDollarPrice(currentPrice)}
          </span>
        ) : (
          <span className="font-mono text-xl text-default-400">—</span>
        )}
      </div>
    </div>
  );
}
