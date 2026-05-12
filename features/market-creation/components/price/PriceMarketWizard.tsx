"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useConnection } from "wagmi";

import {
  DEFAULT_PRICE_FORM,
  PRICE_WIZARD_STEPS,
  type PriceMarketFormData,
  type PriceWizardStep,
} from "../../types";
import { usePriceMarketCreation } from "../../hooks/usePriceMarketCreation";
import { PYTH_FEED_ID_REGEX } from "../../lib/pythFeeds";
import { MarketCreationSuccess } from "../MarketCreationSuccess";
import { WizardLayout } from "../WizardLayout";

import { StepPriceFeed } from "./StepPriceFeed";
import { StepPriceMeta } from "./StepPriceMeta";
import { StepPriceReview } from "./StepPriceReview";
import { StepPriceWindow } from "./StepPriceWindow";

import { TransactionFlowModal } from "@/lib/oddmaki/TransactionFlowModal";

interface PriceMarketWizardProps {
  venueId: bigint;
  creationFee: number;
  baseUmaReward: number;
  onChangeType: () => void;
  onClose?: () => void;
}

const MIN_DURATION_SECONDS = 5 * 60;

function resolveTz(value: string): string {
  if (value === "local") {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  return value;
}

function tzAbbreviation(tz: string): string {
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

function toDatetimeLocalInTz(utcMs: number, tz: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(utcMs));
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "00";

  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

function parseDatetimeLocalInTz(value: string, tz: string): number {
  const [datePart, timePart] = value.split("T");

  if (!datePart || !timePart) return 0;
  const [y, m, d] = datePart.split("-").map(Number);
  const [h, min] = timePart.split(":").map(Number);
  const naiveUtc = Date.UTC(y, m - 1, d, h, min);
  const formatted = toDatetimeLocalInTz(naiveUtc, tz);
  const [fDate, fTime] = formatted.split("T");
  const [fy, fm, fd] = fDate.split("-").map(Number);
  const [fh, fmin] = fTime.split(":").map(Number);
  const formattedUtc = Date.UTC(fy, fm - 1, fd, fh, fmin);
  const offset = formattedUtc - naiveUtc;

  return naiveUtc - offset;
}

function isValidStrike(form: PriceMarketFormData): boolean {
  if (!form.useStrikePrice) return true;
  const v = Number(form.strikePrice);

  return Number.isFinite(v) && v > 0;
}

function isStepValid(
  step: PriceWizardStep,
  form: PriceMarketFormData,
  closeTimeUnix: number | null,
): boolean {
  switch (step) {
    case "feed":
      return (
        PYTH_FEED_ID_REGEX.test(form.pythFeedId.trim()) && isValidStrike(form)
      );
    case "window": {
      if (closeTimeUnix === null) return false;
      const now = Math.floor(Date.now() / 1000);

      return closeTimeUnix - now >= MIN_DURATION_SECONDS;
    }
    case "meta":
      return true;
    case "review":
      return (
        PYTH_FEED_ID_REGEX.test(form.pythFeedId.trim()) &&
        isValidStrike(form) &&
        closeTimeUnix !== null
      );
  }
}

export function PriceMarketWizard({
  venueId,
  creationFee,
  baseUmaReward,
  onChangeType,
  onClose,
}: PriceMarketWizardProps) {
  const { address } = useConnection();
  const [formData, setFormData] =
    useState<PriceMarketFormData>(DEFAULT_PRICE_FORM);
  const [currentStep, setCurrentStep] = useState<PriceWizardStep>("feed");
  const [hasCompleted, setHasCompleted] = useState(false);
  const [flowOpen, setFlowOpen] = useState(false);
  const [tick, setTick] = useState(() => Date.now());

  useEffect(() => {
    if (formData.closeMode !== "preset") return;
    const t = setInterval(() => setTick(Date.now()), 30_000);

    return () => clearInterval(t);
  }, [formData.closeMode]);

  const creation = usePriceMarketCreation(venueId);

  const updateField = useCallback(
    <K extends keyof PriceMarketFormData>(
      key: K,
      value: PriceMarketFormData[K],
    ) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const effectiveTz = useMemo(
    () => resolveTz(formData.customTimezone),
    [formData.customTimezone],
  );
  const tzAbbr = useMemo(() => tzAbbreviation(effectiveTz), [effectiveTz]);

  const closeTimeUnix = useMemo<number | null>(() => {
    if (formData.closeMode === "preset") {
      return Math.floor(tick / 1000) + formData.presetSeconds;
    }
    if (!formData.customDatetime) return null;

    return Math.floor(
      parseDatetimeLocalInTz(formData.customDatetime, effectiveTz) / 1000,
    );
  }, [
    formData.closeMode,
    formData.presetSeconds,
    formData.customDatetime,
    effectiveTz,
    tick,
  ]);

  const closeDisplay = useMemo<string | null>(() => {
    if (closeTimeUnix === null) return null;
    try {
      return (
        new Intl.DateTimeFormat("en-US", {
          timeZone: effectiveTz,
          dateStyle: "medium",
          timeStyle: "short",
        }).format(new Date(closeTimeUnix * 1000)) + ` (${tzAbbr})`
      );
    } catch {
      return new Date(closeTimeUnix * 1000).toLocaleString();
    }
  }, [closeTimeUnix, effectiveTz, tzAbbr]);

  const outcomes = useMemo<[string, string]>(
    () => (formData.useStrikePrice ? ["Above", "Below"] : ["Up", "Down"]),
    [formData.useStrikePrice],
  );

  const autoTitle = useMemo(() => {
    const symbol = formData.feedSymbol || "Asset";

    if (
      formData.useStrikePrice &&
      formData.strikePrice &&
      Number(formData.strikePrice) > 0
    ) {
      return `${symbol} Above/Below $${Number(formData.strikePrice).toLocaleString()}`;
    }
    if (closeDisplay) {
      return `${symbol} Up/Down by ${closeDisplay}`;
    }

    return "";
  }, [
    formData.feedSymbol,
    formData.useStrikePrice,
    formData.strikePrice,
    closeDisplay,
  ]);

  const autoDescription = useMemo(() => {
    const symbol = formData.feedSymbol || "the asset";

    if (
      formData.useStrikePrice &&
      Number(formData.strikePrice) > 0 &&
      closeDisplay
    ) {
      return `Resolves Above if Pyth ${symbol} ≥ $${Number(formData.strikePrice).toLocaleString()} at ${closeDisplay}, otherwise Below.`;
    }
    if (closeDisplay) {
      return `Resolves Up if Pyth ${symbol} closes higher than at creation by ${closeDisplay}, otherwise Down.`;
    }

    return "";
  }, [
    formData.feedSymbol,
    formData.useStrikePrice,
    formData.strikePrice,
    closeDisplay,
  ]);

  const stepIndex = PRICE_WIZARD_STEPS.findIndex((s) => s.id === currentStep);
  const totalSteps = PRICE_WIZARD_STEPS.length;
  const stepInfo = PRICE_WIZARD_STEPS[stepIndex];
  const valid = useMemo(
    () => isStepValid(currentStep, formData, closeTimeUnix),
    [currentStep, formData, closeTimeUnix],
  );

  const goNext = useCallback(() => {
    const next = PRICE_WIZARD_STEPS[stepIndex + 1];

    if (next) setCurrentStep(next.id);
  }, [stepIndex]);

  const goBack = useCallback(() => {
    const prev = PRICE_WIZARD_STEPS[stepIndex - 1];

    if (prev) setCurrentStep(prev.id);
  }, [stepIndex]);

  const submit = useCallback(() => {
    if (!address || closeTimeUnix === null) return;
    setHasCompleted(true);
    setFlowOpen(true);
    creation.createPriceMarket(
      formData,
      {
        closeTimeUnix,
        outcomes,
        title: formData.title.trim() || autoTitle,
        description: formData.description.trim() || autoDescription,
      },
      address,
    );
  }, [
    address,
    autoDescription,
    autoTitle,
    closeTimeUnix,
    creation,
    formData,
    outcomes,
  ]);

  const reset = useCallback(() => {
    setFormData(DEFAULT_PRICE_FORM);
    setCurrentStep("feed");
    setHasCompleted(false);
    setFlowOpen(false);
    creation.reset();
  }, [creation]);

  const handleFlowClose = useCallback(() => {
    setFlowOpen(false);
    if (!creation.isComplete) {
      creation.reset();
      setHasCompleted(false);
    }
  }, [creation]);

  if (hasCompleted && creation.isComplete && !flowOpen) {
    return (
      <MarketCreationSuccess
        marketTitle={formData.title.trim() || autoTitle}
        marketType="price"
        onClose={onClose}
        onCreateAnother={() => {
          reset();
          onChangeType();
        }}
      />
    );
  }

  return (
    <>
      <WizardLayout
        canGoBack={stepIndex > 0}
        canGoNext={valid}
        invalidHint={
          currentStep === "window"
            ? "Close time must be at least 5 minutes from now"
            : "Complete required fields to continue"
        }
        isLastStep={stepIndex === totalSteps - 1}
        isSubmitting={creation.isRunning}
        step={stepInfo}
        stepIndex={stepIndex}
        submitLabel="Create price market"
        totalSteps={totalSteps}
        onBack={goBack}
        onNext={goNext}
        onSubmit={submit}
      >
        {currentStep === "feed" && (
          <StepPriceFeed formData={formData} updateField={updateField} />
        )}
        {currentStep === "window" && (
          <StepPriceWindow formData={formData} updateField={updateField} />
        )}
        {currentStep === "meta" && (
          <StepPriceMeta
            autoDescription={autoDescription}
            autoTitle={autoTitle}
            formData={formData}
            updateField={updateField}
          />
        )}
        {currentStep === "review" && (
          <StepPriceReview
            baseUmaReward={baseUmaReward}
            closeDisplay={closeDisplay}
            creationFee={creationFee}
            formData={formData}
            outcomes={outcomes}
            resolvedDescription={formData.description.trim() || autoDescription}
            resolvedTitle={formData.title.trim() || autoTitle}
          />
        )}
      </WizardLayout>

      <TransactionFlowModal
        hasError={creation.hasError}
        isComplete={creation.isComplete}
        isOpen={flowOpen}
        isRunning={creation.isRunning}
        stepStates={creation.stepStates}
        title="Create price market"
        onClose={handleFlowClose}
        onRetry={creation.retry}
      />
    </>
  );
}
