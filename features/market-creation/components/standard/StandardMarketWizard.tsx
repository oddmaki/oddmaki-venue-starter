"use client";

import { useCallback, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { isAddress } from "viem";

import {
  DEFAULT_STANDARD_FORM,
  STANDARD_WIZARD_STEPS,
  type StandardMarketFormData,
  type StandardWizardStep,
} from "../../types";
import { useStandardMarketCreation } from "../../hooks/useStandardMarketCreation";
import { MarketCreationSuccess } from "../MarketCreationSuccess";
import { WizardLayout } from "../WizardLayout";

import { StepStandardAccessControl } from "./StepStandardAccessControl";
import { StepStandardOutcomes } from "./StepStandardOutcomes";
import { StepStandardQuestion } from "./StepStandardQuestion";
import { StepStandardReview } from "./StepStandardReview";
import { StepStandardSettings } from "./StepStandardSettings";

import { TransactionFlowModal } from "@/lib/oddmaki/TransactionFlowModal";

interface StandardMarketWizardProps {
  venueId: bigint;
  venueTradingAC: string | null;
  baseUmaReward: number;
  creationFee: number;
  onChangeType: () => void;
  onClose?: () => void;
}

function isACBranchValid(form: StandardMarketFormData): boolean {
  switch (form.tradingACType) {
    case "public":
    case "whitelist":
      return true;
    case "nft-erc721":
      return isAddress(form.tradingACNftContract.trim());
    case "nft-erc1155":
      return (
        isAddress(form.tradingACNftContract.trim()) &&
        form.tradingACNftTokenId.trim().length > 0
      );
    case "token":
      return (
        isAddress(form.tradingACTokenContract.trim()) &&
        form.tradingACTokenMinBalance.trim().length > 0
      );
    case "custom":
      return isAddress(form.tradingACCustomAddress.trim());
  }
}

function isStepValid(
  step: StandardWizardStep,
  form: StandardMarketFormData,
): boolean {
  switch (step) {
    case "question":
      return form.title.trim().length > 0 && form.description.trim().length > 0;
    case "outcomes": {
      if (form.outcomeMode === "binary") return true;
      const a = (form.outcomes[0] ?? "").trim();
      const b = (form.outcomes[1] ?? "").trim();

      return (
        a.length > 0 && b.length > 0 && a.toLowerCase() !== b.toLowerCase()
      );
    }
    case "settings":
      return form.additionalReward >= 0 && form.liveness >= 0;
    case "access-control":
      return isACBranchValid(form);
    case "review":
      return form.title.trim().length > 0 && form.description.trim().length > 0;
  }
}

export function StandardMarketWizard({
  venueId,
  venueTradingAC,
  baseUmaReward,
  creationFee,
  onChangeType,
  onClose,
}: StandardMarketWizardProps) {
  const { address } = useAccount();
  const [formData, setFormData] = useState<StandardMarketFormData>(
    DEFAULT_STANDARD_FORM,
  );
  const [currentStep, setCurrentStep] =
    useState<StandardWizardStep>("question");
  const [hasCompleted, setHasCompleted] = useState(false);
  const [flowOpen, setFlowOpen] = useState(false);

  const creation = useStandardMarketCreation(venueId);

  const updateField = useCallback(
    <K extends keyof StandardMarketFormData>(
      key: K,
      value: StandardMarketFormData[K],
    ) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const stepIndex = STANDARD_WIZARD_STEPS.findIndex(
    (s) => s.id === currentStep,
  );
  const totalSteps = STANDARD_WIZARD_STEPS.length;
  const stepInfo = STANDARD_WIZARD_STEPS[stepIndex];
  const valid = useMemo(
    () => isStepValid(currentStep, formData),
    [currentStep, formData],
  );

  const goNext = useCallback(() => {
    const next = STANDARD_WIZARD_STEPS[stepIndex + 1];

    if (next) setCurrentStep(next.id);
  }, [stepIndex]);

  const goBack = useCallback(() => {
    const prev = STANDARD_WIZARD_STEPS[stepIndex - 1];

    if (prev) setCurrentStep(prev.id);
  }, [stepIndex]);

  const submit = useCallback(() => {
    if (!address) return;
    setHasCompleted(true);
    setFlowOpen(true);
    creation.createMarket(formData, address);
  }, [address, creation, formData]);

  const reset = useCallback(() => {
    setFormData(DEFAULT_STANDARD_FORM);
    setCurrentStep("question");
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
        marketTitle={formData.title}
        marketType="standard"
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
        invalidHint="Complete required fields to continue"
        isLastStep={stepIndex === totalSteps - 1}
        isSubmitting={creation.isRunning}
        step={stepInfo}
        stepIndex={stepIndex}
        submitLabel="Create market"
        totalSteps={totalSteps}
        onBack={goBack}
        onNext={goNext}
        onSubmit={submit}
      >
        {currentStep === "question" && (
          <StepStandardQuestion formData={formData} updateField={updateField} />
        )}
        {currentStep === "outcomes" && (
          <StepStandardOutcomes formData={formData} updateField={updateField} />
        )}
        {currentStep === "settings" && (
          <StepStandardSettings
            baseUmaReward={baseUmaReward}
            formData={formData}
            updateField={updateField}
          />
        )}
        {currentStep === "access-control" && (
          <StepStandardAccessControl
            formData={formData}
            updateField={updateField}
            venueTradingAC={venueTradingAC}
          />
        )}
        {currentStep === "review" && (
          <StepStandardReview
            baseUmaReward={baseUmaReward}
            creationFee={creationFee}
            formData={formData}
          />
        )}
      </WizardLayout>

      <TransactionFlowModal
        hasError={creation.hasError}
        isComplete={creation.isComplete}
        isOpen={flowOpen}
        isRunning={creation.isRunning}
        stepStates={creation.stepStates}
        title="Create market"
        onClose={handleFlowClose}
        onRetry={creation.retry}
      />
    </>
  );
}
