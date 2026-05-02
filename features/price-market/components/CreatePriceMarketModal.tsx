"use client";

import type { PythFeedOption } from "../hooks/usePythFeeds";

import { useState, useEffect, useMemo } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Switch } from "@heroui/switch";

import { useCreatePriceMarket } from "../hooks/useCreatePriceMarket";
import { DURATION_PRESETS, PYTH_FEED_MAP } from "../constants/pythFeeds";

import { PythFeedSelector } from "./PythFeedSelector";

import { TransactionFlowModal } from "@/lib/oddmaki/TransactionFlowModal";

const PYTH_FEED_ID_REGEX = /^0x[0-9a-fA-F]{64}$/;
const PYTH_HERMES_BASE = "https://hermes.pyth.network";

const COMMON_TIMEZONES = [
  { label: "Local Time", value: "local" },
  { label: "UTC", value: "UTC" },
  { label: "US Eastern (ET)", value: "America/New_York" },
  { label: "US Central (CT)", value: "America/Chicago" },
  { label: "US Pacific (PT)", value: "America/Los_Angeles" },
  { label: "London (GMT/BST)", value: "Europe/London" },
  { label: "Central European (CET)", value: "Europe/Berlin" },
  { label: "Tokyo (JST)", value: "Asia/Tokyo" },
  { label: "Hong Kong (HKT)", value: "Asia/Hong_Kong" },
  { label: "Singapore (SGT)", value: "Asia/Singapore" },
  { label: "Sydney (AEST)", value: "Australia/Sydney" },
] as const;

interface CreatePriceMarketModalProps {
  isOpen: boolean;
  onClose: () => void;
  venueId: bigint;
}

/** Format a UTC timestamp to a datetime-local string in a specific timezone. */
function toDatetimeLocalInTz(utcMs: number, tz: string): string {
  const d = new Date(utcMs);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "00";

  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

/** Parse a datetime-local string as if it were in the given timezone → UTC ms. */
function parseDatetimeLocalInTz(dtStr: string, tz: string): number {
  // datetime-local gives "YYYY-MM-DDTHH:mm"
  // We build a formatter in the target tz and reverse-map
  const [datePart, timePart] = dtStr.split("T");

  if (!datePart || !timePart) return 0;
  const [y, m, d] = datePart.split("-").map(Number);
  const [h, min] = timePart.split(":").map(Number);

  // Binary search: find the UTC ms where formatting in `tz` gives the target wall-clock
  // Start with a naive guess assuming UTC
  const naiveUtc = Date.UTC(y, m - 1, d, h, min);

  // Get the offset at the naive guess
  const formatted = toDatetimeLocalInTz(naiveUtc, tz);
  const [fDate, fTime] = formatted.split("T");
  const [fy, fm, fd] = fDate.split("-").map(Number);
  const [fh, fmin] = fTime.split(":").map(Number);

  const formattedUtc = Date.UTC(fy, fm - 1, fd, fh, fmin);
  const offsetMs = formattedUtc - naiveUtc;

  // Adjust: desired wall-clock = naiveUtc, actual wall-clock = naiveUtc + offset
  // So real UTC = naiveUtc - offset
  return naiveUtc - offsetMs;
}

/** Get a short timezone abbreviation for display. */
function getTzAbbreviation(tz: string): string {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "short",
    }).formatToParts(new Date());

    return parts.find((p) => p.type === "timeZoneName")?.value ?? tz;
  } catch {
    return tz;
  }
}

export function CreatePriceMarketModal({
  isOpen,
  onClose,
  venueId,
}: CreatePriceMarketModalProps) {
  const [feedId, setFeedId] = useState("");
  const [useStrikePrice, setUseStrikePrice] = useState(false);
  const [strikePrice, setStrikePrice] = useState("");
  const [selectedPreset, setSelectedPreset] = useState("");
  const [customDatetime, setCustomDatetime] = useState("");
  const [useCustomTime, setUseCustomTime] = useState(false);
  const [selectedTz, setSelectedTz] = useState("local");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState("");
  const [flowActive, setFlowActive] = useState(false);
  const [tickSize, setTickSize] = useState("0.01");
  const [currentPrice, setCurrentPrice] = useState<string | null>(null);
  const [priceExpo, setPriceExpo] = useState<number>(-8);

  const { startCreatePriceMarket, flow } = useCreatePriceMarket();

  const selectedDuration = DURATION_PRESETS.find(
    (d) => d.value.toString() === selectedPreset,
  );

  const isValidFeedId = PYTH_FEED_ID_REGEX.test(feedId.trim());

  // Resolve the effective IANA timezone
  const effectiveTz = useMemo(() => {
    if (selectedTz === "local") {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    }

    return selectedTz;
  }, [selectedTz]);

  const tzAbbr = useMemo(() => getTzAbbreviation(effectiveTz), [effectiveTz]);

  // Fetch current price when feed changes
  useEffect(() => {
    if (!isValidFeedId) {
      setCurrentPrice(null);

      return;
    }

    const trimmedFeedId = feedId.trim();
    const knownFeed = PYTH_FEED_MAP.get(trimmedFeedId as `0x${string}`);

    if (knownFeed) {
      setPriceExpo(knownFeed.expo);
    }

    fetch(`${PYTH_HERMES_BASE}/v2/updates/price/latest?ids[]=${trimmedFeedId}`)
      .then((res) => res.json())
      .then((data) => {
        const parsed = data?.parsed?.[0];

        if (parsed) {
          const expo = parsed.price?.expo ?? -8;

          setPriceExpo(expo);
          const price = Number(parsed.price?.price ?? 0) * Math.pow(10, expo);

          setCurrentPrice(price.toFixed(2));
        }
      })
      .catch(() => setCurrentPrice(null));
  }, [feedId, isValidFeedId]);

  const getCloseTime = (): number | null => {
    if (useCustomTime && customDatetime) {
      return Math.floor(
        parseDatetimeLocalInTz(customDatetime, effectiveTz) / 1000,
      );
    }
    if (selectedPreset) {
      return Math.floor(Date.now() / 1000) + Number(selectedPreset);
    }

    return null;
  };

  const closeTime = getCloseTime();
  const hasValidTime = closeTime !== null;
  const hasValidStrike =
    !useStrikePrice || (strikePrice.trim() !== "" && Number(strikePrice) > 0);

  // Convert human-readable strike price to raw int64
  const getRawStrikePrice = (): bigint | undefined => {
    if (!useStrikePrice) return undefined;
    const humanPrice = Number(strikePrice);

    return BigInt(Math.round(humanPrice * Math.pow(10, Math.abs(priceExpo))));
  };

  // Outcome labels depend on mode
  const outcomes: [string, string] = useStrikePrice
    ? ["Above", "Below"]
    : ["Up", "Down"];

  // Auto-generate title/description
  const autoTitle = (() => {
    const feed = PYTH_FEED_MAP.get(feedId.trim() as `0x${string}`);
    const feedName = feed?.symbol ?? "Asset";

    if (useStrikePrice && strikePrice.trim() && Number(strikePrice) > 0) {
      return `${feedName} Above/Below $${Number(strikePrice).toLocaleString()}`;
    }
    const durationLabel = selectedDuration?.label ?? "";

    return feedName !== "Asset"
      ? `${feedName} ${durationLabel} Up or Down`.trim()
      : "";
  })();

  const autoDescription = (() => {
    const feed = PYTH_FEED_MAP.get(feedId.trim() as `0x${string}`);
    const feedName = feed?.symbol ?? "the asset";

    if (useStrikePrice && hasValidStrike && closeTime) {
      const closeDate = new Date(closeTime * 1000).toLocaleString();

      return `Will ${feedName} be above or below $${Number(strikePrice).toLocaleString()} at ${closeDate}?`;
    }
    if (closeTime) {
      return `Will ${feedName} go up or down by ${selectedDuration?.label ?? new Date(closeTime * 1000).toLocaleString()}?`;
    }

    return "";
  })();

  const resetForm = () => {
    setFeedId("");
    setUseStrikePrice(false);
    setStrikePrice("");
    setSelectedPreset("");
    setCustomDatetime("");
    setUseCustomTime(false);
    setSelectedTz("local");
    setTickSize("0.01");
    setTitle("");
    setDescription("");
    setFormError("");
    setCurrentPrice(null);
  };

  const handleClose = () => {
    if (!flow.isRunning) {
      resetForm();
      setFlowActive(false);
      flow.reset();
      onClose();
    }
  };

  const handleFeedSelect = (_feed: PythFeedOption) => {
    // Title auto-generates from feedId + strike/duration state
  };

  const handleSubmit = async () => {
    setFormError("");

    const trimmedFeedId = feedId.trim();

    if (!trimmedFeedId) {
      setFormError("Pyth Feed ID is required");

      return;
    }
    if (!isValidFeedId) {
      setFormError(
        "Invalid Feed ID. Must be a 0x-prefixed 64-character hex string.",
      );

      return;
    }
    if (useStrikePrice && (!strikePrice.trim() || Number(strikePrice) <= 0)) {
      setFormError("Strike price must be a positive number");

      return;
    }
    if (!hasValidTime || closeTime === null) {
      setFormError("Please select a close time");

      return;
    }
    const now = Math.floor(Date.now() / 1000);

    if (closeTime - now < 300) {
      setFormError("Close time must be at least 5 minutes from now");

      return;
    }

    const finalTitle = title.trim() || autoTitle;

    if (!finalTitle) {
      setFormError("Title is required");

      return;
    }

    // Recompute closeTime fresh for duration presets to avoid stale Date.now().
    // Add 30s buffer to account for wallet signing + block inclusion delay.
    const TX_MINING_BUFFER = 30;
    const freshCloseTime =
      selectedPreset && !useCustomTime
        ? Math.floor(Date.now() / 1000) +
          Number(selectedPreset) +
          TX_MINING_BUFFER
        : closeTime;

    setFlowActive(true);
    await startCreatePriceMarket({
      venueId,
      pythFeedId: trimmedFeedId as `0x${string}`,
      strikePrice: getRawStrikePrice(),
      closeTime: freshCloseTime,
      outcomes: [outcomes[0], outcomes[1]],
      title: finalTitle,
      description: description.trim() || autoDescription,
      tickSize,
      tags: useStrikePrice ? ["price-market", "strike"] : ["price-market"],
    });
  };

  const handleFlowClose = () => {
    if (flow.isComplete) {
      resetForm();
      setFlowActive(false);
      flow.reset();
      onClose();
    } else {
      setFlowActive(false);
      flow.reset();
    }
  };

  // Compute min datetime (5 min from now) in the selected timezone
  const nowMs = Date.now();
  const minDatetime = toDatetimeLocalInTz(nowMs + 300_000, effectiveTz);

  // Format close time for display with timezone
  const closeTimeDisplay = useMemo(() => {
    if (!hasValidTime || closeTime === null) return null;
    try {
      return (
        new Intl.DateTimeFormat("en-US", {
          timeZone: effectiveTz,
          dateStyle: "medium",
          timeStyle: "short",
        }).format(new Date(closeTime * 1000)) + ` (${tzAbbr})`
      );
    } catch {
      return new Date(closeTime * 1000).toLocaleString();
    }
  }, [closeTime, hasValidTime, effectiveTz, tzAbbr]);

  if (flowActive) {
    return (
      <TransactionFlowModal
        hasError={flow.hasError}
        isComplete={flow.isComplete}
        isOpen={isOpen}
        isRunning={flow.isRunning}
        stepStates={flow.stepStates}
        title="Creating Price Market"
        onClose={handleFlowClose}
        onRetry={flow.retry}
      />
    );
  }

  const isFormValid =
    isValidFeedId &&
    hasValidStrike &&
    hasValidTime &&
    !!(title.trim() || autoTitle);

  return (
    <Modal
      isOpen={isOpen}
      scrollBehavior="inside"
      size="lg"
      onClose={handleClose}
    >
      <ModalContent>
        <ModalHeader>Create Price Market</ModalHeader>
        <ModalBody className="gap-4">
          <PythFeedSelector
            feedId={feedId}
            onClearError={() => setFormError("")}
            onFeedIdChange={setFeedId}
            onFeedSelect={handleFeedSelect}
          />

          {/* Current price display (always shown when available) */}
          {currentPrice && (
            <p className="text-sm text-default-500">
              Current price:{" "}
              <span className="font-medium text-foreground">
                ${currentPrice}
              </span>
            </p>
          )}

          {/* Strike Price toggle */}
          <div className="flex flex-col gap-2">
            <Switch
              isSelected={useStrikePrice}
              size="sm"
              onValueChange={(v) => {
                setUseStrikePrice(v);
                setFormError("");
              }}
            >
              <span className="text-sm">Set target strike price</span>
            </Switch>
            <p className="text-xs text-default-400">
              {useStrikePrice
                ? "Market resolves based on whether the price is above or below your target at close time."
                : "Market resolves based on whether the price goes up or down from the current price at creation."}
            </p>
            {useStrikePrice && (
              <Input
                isRequired
                description={
                  currentPrice ? `Current price: $${currentPrice}` : undefined
                }
                label="Strike Price"
                placeholder="e.g. 2500"
                startContent={
                  <span className="text-default-400 text-sm">$</span>
                }
                type="number"
                value={strikePrice}
                onValueChange={(v) => {
                  setStrikePrice(v);
                  setFormError("");
                }}
              />
            )}
          </div>

          {/* Close Time */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Close Time</span>
            <div className="flex gap-2 flex-wrap">
              {DURATION_PRESETS.map((preset) => (
                <Button
                  key={preset.value}
                  color={
                    !useCustomTime && selectedPreset === preset.value.toString()
                      ? "primary"
                      : "default"
                  }
                  size="sm"
                  variant={
                    !useCustomTime && selectedPreset === preset.value.toString()
                      ? "solid"
                      : "bordered"
                  }
                  onPress={() => {
                    setSelectedPreset(preset.value.toString());
                    setUseCustomTime(false);
                    setFormError("");
                  }}
                >
                  {preset.label}
                </Button>
              ))}
              <Button
                color={useCustomTime ? "primary" : "default"}
                size="sm"
                variant={useCustomTime ? "solid" : "bordered"}
                onPress={() => {
                  setUseCustomTime(true);
                  setSelectedPreset("");
                  setFormError("");
                }}
              >
                Custom
              </Button>
            </div>
            {useCustomTime && (
              <div className="flex flex-col gap-2">
                <Select
                  className="max-w-xs"
                  label="Timezone"
                  selectedKeys={[selectedTz]}
                  size="sm"
                  onSelectionChange={(keys) => {
                    const val = Array.from(keys)[0] as string;

                    if (val) setSelectedTz(val);
                  }}
                >
                  {COMMON_TIMEZONES.map((tz) => (
                    <SelectItem key={tz.value}>
                      {tz.label}
                      {tz.value !== "local"
                        ? ` (${getTzAbbreviation(tz.value)})`
                        : ` (${tzAbbr})`}
                    </SelectItem>
                  ))}
                </Select>
                <Input
                  description={`Must be at least 5 minutes from now. Times are in ${tzAbbr}.`}
                  min={minDatetime}
                  type="datetime-local"
                  value={customDatetime}
                  onValueChange={(v) => {
                    setCustomDatetime(v);
                    setFormError("");
                  }}
                />
              </div>
            )}
            {closeTimeDisplay && (
              <p className="text-xs text-default-400">
                Closes at: {closeTimeDisplay}
              </p>
            )}
          </div>

          {/* Title */}
          <Input
            description={
              autoTitle && !title.trim() ? `Auto: ${autoTitle}` : undefined
            }
            label="Title"
            placeholder={autoTitle || "ETH/USD Above/Below $2,500"}
            value={title}
            onValueChange={(v) => {
              setTitle(v);
              setFormError("");
            }}
          />

          {/* Description */}
          <Input
            description={
              autoDescription && !description.trim()
                ? `Auto: ${autoDescription}`
                : undefined
            }
            label="Description"
            placeholder="Resolution criteria (optional)"
            value={description}
            onValueChange={setDescription}
          />

          <Select
            description={
              tickSize === "0.01"
                ? "100 price levels (standard)"
                : "1,000 price levels (fine)"
            }
            label="Tick Size"
            selectedKeys={[tickSize]}
            size="sm"
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0] as string;

              if (selected) setTickSize(selected);
            }}
          >
            <SelectItem key="0.01">$0.01 (1%)</SelectItem>
            <SelectItem key="0.001">$0.001 (0.1%)</SelectItem>
          </Select>

          {/* Outcome preview */}
          <p className="text-xs text-default-400">
            Outcomes: <span className="font-medium">{outcomes[0]}</span> /{" "}
            <span className="font-medium">{outcomes[1]}</span>
          </p>

          {formError && <p className="text-danger text-sm">{formError}</p>}
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={handleClose}>
            Cancel
          </Button>
          <Button
            color="primary"
            isDisabled={!isFormValid}
            onPress={handleSubmit}
          >
            Create Price Market
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
