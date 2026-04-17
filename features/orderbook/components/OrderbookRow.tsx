'use client';

import { Chip } from '@heroui/chip';
import type { OrderbookLevel } from '../hooks/useOrderbookLevels';

interface OrderbookRowProps {
  level: OrderbookLevel;
  side: 'bid' | 'ask';
  /** 0-1 ratio for depth bar width */
  depthRatio: number;
  /** Optional chip label shown in the depth-bar area */
  label?: { text: string; color: 'primary' | 'secondary' };
  onPriceClick?: (price: string, tick: bigint) => void;
}

export function OrderbookRow({ level, side, depthRatio, label, onPriceClick }: OrderbookRowProps) {
  const isBid = side === 'bid';
  const barColor = isBid ? 'bg-primary/15' : 'bg-secondary/10';
  const priceColor = isBid ? 'text-primary' : 'text-secondary';

  return (
    <div
      className="relative flex items-center h-7 px-2 cursor-pointer hover:bg-default-100 transition-colors text-xs font-mono"
      onClick={() => onPriceClick?.(level.price, level.tick)}
    >
      {/* Depth bar background — anchored left */}
      <div
        className={`absolute inset-y-0 left-0 ${barColor}`}
        style={{ width: `${Math.max(depthRatio * 40, 1)}%` }}
      />

      {/* Content — left area for depth bar + optional label, data on the right */}
      <div className="relative z-10 flex w-full items-center">
        <span className="w-[25%] sm:w-[40%] flex items-center">
          {label && (
            <Chip size="sm" color={label.color} variant="flat">{label.text}</Chip>
          )}
        </span>
        <span className={`${priceColor} font-semibold flex-1 text-center`}>
          {level.price}
        </span>
        <span className="text-default-600 flex-1 text-right">
          {level.quantity}
        </span>
        <span className="text-default-400 w-[60px] sm:w-[70px] text-right">
          {level.cumulative}
        </span>
      </div>
    </div>
  );
}
