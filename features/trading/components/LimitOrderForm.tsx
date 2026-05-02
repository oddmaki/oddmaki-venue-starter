"use client";

import { useState, useMemo, useRef } from "react";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import { Switch } from "@heroui/switch";
import { Divider } from "@heroui/divider";
import { useConnection } from "wagmi";

import { usePlaceLimitOrder } from "../hooks/usePlaceLimitOrder";

import { TransactionFlowModal } from "@/lib/oddmaki/TransactionFlowModal";
import { useCanTradeOnMarket } from "@/features/access-control";

interface LimitOrderFormProps {
  marketId: string;
  outcomeIndex: 0 | 1;
  outcomeName: string;
  side: "BUY" | "SELL";
  /** Pre-filled price from orderbook click */
  prefillPrice?: string;
}

const EXPIRY_OPTIONS = [
  { key: "5m", label: "5 minutes" },
  { key: "1h", label: "1 hour" },
  { key: "24h", label: "24 hours" },
  { key: "7d", label: "7 days" },
  { key: "30d", label: "30 days" },
];

const QUANTITY_DELTAS = [-100, -10, 1, 10, 100];

export function LimitOrderForm({
  marketId,
  outcomeIndex,
  outcomeName,
  side,
  prefillPrice,
}: LimitOrderFormProps) {
  const { isConnected } = useConnection();
  const { startPlaceLimitOrder, flow } = usePlaceLimitOrder();
  const { data: canTrade = true } = useCanTradeOnMarket(
    marketId ? BigInt(marketId) : undefined,
  );

  const [price, setPrice] = useState(prefillPrice || "");
  const [quantity, setQuantity] = useState("");
  const [expiryEnabled, setExpiryEnabled] = useState(false);
  const [expiry, setExpiry] = useState("gtc");
  const [flowOpen, setFlowOpen] = useState(false);

  // Only sync price when prefillPrice itself changes (not on every render)
  const lastPrefillRef = useRef(prefillPrice);

  if (
    prefillPrice &&
    prefillPrice !== lastPrefillRef.current &&
    !flow.isRunning
  ) {
    lastPrefillRef.current = prefillPrice;
    setPrice(prefillPrice);
  }

  const costEstimate = useMemo(() => {
    const p = parseFloat(price);
    const q = parseFloat(quantity);

    if (isNaN(p) || isNaN(q) || p <= 0 || q <= 0) return null;
    const total = p * q;

    return total.toFixed(2);
  }, [price, quantity]);

  const isValid = (() => {
    const p = parseFloat(price);
    const q = parseFloat(quantity);

    return !isNaN(p) && !isNaN(q) && p > 0 && p < 1 && q > 0;
  })();

  const handleSubmit = async () => {
    if (!isValid) return;
    setFlowOpen(true);
    await startPlaceLimitOrder({
      marketId,
      outcomeIndex,
      side,
      price,
      quantity,
      expiry,
    });
  };

  const handleFlowClose = () => {
    if (flow.isComplete) {
      setQuantity("");
    }
    setFlowOpen(false);
    flow.reset();
  };

  const sideLabel = side === "BUY" ? "Buy" : "Sell";
  const sideColor = side === "BUY" ? "primary" : "secondary";

  const priceCents = price ? Math.round(parseFloat(price) * 100) : null;

  const toWin = useMemo(() => {
    const p = parseFloat(price);
    const q = parseFloat(quantity);

    if (isNaN(p) || isNaN(q) || p <= 0 || q <= 0) return null;

    return (q * (1 - p)).toFixed(2);
  }, [price, quantity]);

  return (
    <div className="flex flex-col gap-3">
      {/* Limit Price — compact row: label left, stepper right */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-default-500">Limit Price</span>
        <div className="flex items-center bg-default-100 rounded-lg">
          <button
            className="px-3 py-1.5 text-default-400 hover:text-foreground transition-colors"
            type="button"
            onClick={() => {
              const next = Math.max(0.01, parseFloat(price || "0") - 0.01);

              setPrice(next.toFixed(2));
            }}
          >
            &minus;
          </button>
          <span className="px-2 py-1.5 text-sm font-semibold min-w-[3rem] text-center">
            {priceCents != null ? `${priceCents}¢` : "—"}
          </span>
          <button
            className="px-3 py-1.5 text-default-400 hover:text-foreground transition-colors"
            type="button"
            onClick={() => {
              const next = Math.min(0.99, parseFloat(price || "0") + 0.01);

              setPrice(next.toFixed(2));
            }}
          >
            +
          </button>
        </div>
      </div>

      <Divider className="my-0" />

      {/* Shares — compact row: label left, input right */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-default-500">Shares</span>
        <input
          className="w-24 text-right bg-transparent text-lg font-semibold text-foreground outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          min="0"
          placeholder="0"
          step="1"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
      </div>

      {/* Quick-add chips with container background */}
      <div className="flex gap-1 rounded-lg p-1.5">
        {QUANTITY_DELTAS.map((d) => (
          <Button
            key={d}
            className="min-w-0 h-6 px-2 bg-default-100 text-xs flex-1"
            size="sm"
            variant="flat"
            onPress={() => {
              const next = Math.max(0, (parseInt(quantity) || 0) + d);

              setQuantity(next > 0 ? String(next) : "");
            }}
          >
            {d > 0 ? `+${d}` : String(d)}
          </Button>
        ))}
      </div>

      <Divider className="my-0" />

      {/* Expiry toggle */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-default-500">Set Expiration</span>
        <Switch
          isSelected={expiryEnabled}
          size="sm"
          onValueChange={(val) => {
            setExpiryEnabled(val);
            if (val) {
              setExpiry("1h");
            } else {
              setExpiry("gtc");
            }
          }}
        />
      </div>
      {expiryEnabled && (
        <Select
          selectedKeys={[expiry]}
          size="sm"
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0] as string;

            if (selected) setExpiry(selected);
          }}
        >
          {EXPIRY_OPTIONS.map((opt) => (
            <SelectItem key={opt.key}>{opt.label}</SelectItem>
          ))}
        </Select>
      )}

      {/* Cost + To Win summary */}
      {costEstimate && (
        <>
          <Divider />
          <div className="flex flex-col gap-1 px-1">
            <div className="flex justify-between text-sm">
              <span className="text-default-400">Total</span>
              <span className="font-semibold">${costEstimate}</span>
            </div>
            {side === "BUY" && toWin && (
              <div className="flex justify-between text-sm">
                <span className="text-default-400">To win</span>
                <span className="font-semibold text-success">${toWin}</span>
              </div>
            )}
          </div>
        </>
      )}

      <Button
        className="w-full"
        color={sideColor}
        isDisabled={!isConnected || !isValid || !canTrade}
        isLoading={flow.isRunning}
        onPress={handleSubmit}
      >
        {!isConnected
          ? "Connect Wallet"
          : !canTrade
            ? "Access Restricted"
            : "Trade"}
      </Button>

      <TransactionFlowModal
        hasError={flow.hasError}
        isComplete={flow.isComplete}
        isOpen={flowOpen}
        isRunning={flow.isRunning}
        stepStates={flow.stepStates}
        title={`${sideLabel} ${outcomeName}`}
        onClose={handleFlowClose}
        onRetry={flow.retry}
      />
    </div>
  );
}
