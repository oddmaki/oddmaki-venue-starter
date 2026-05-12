"use client";

import { useCallback, useMemo, useState } from "react";
import { useConnection } from "wagmi";

import {
  DEFAULT_GROUP_FORM,
  GROUP_WIZARD_STEPS,
  type GroupMarketFormData,
  type GroupWizardStep,
} from "../../types";
import { useGroupMarketCreation } from "../../hooks/useGroupMarketCreation";
import { MarketCreationSuccess } from "../MarketCreationSuccess";
import { WizardLayout } from "../WizardLayout";

import { StepGroupInfo } from "./StepGroupInfo";
import { StepGroupOutcomes } from "./StepGroupOutcomes";
import { StepGroupReview } from "./StepGroupReview";
import { StepGroupSettings } from "./StepGroupSettings";

import { TransactionFlowModal } from "@/lib/oddmaki/TransactionFlowModal";

interface GroupMarketWizardProps {
  venueId: bigint;
  baseUmaReward: number;
  creationFee: number;
  onChangeType: () => void;
  onClose?: () => void;
}

function isStepValid(
  step: GroupWizardStep,
  form: GroupMarketFormData,
): boolean {
  switch (step) {
    case "info":
      return form.title.trim().length > 0 && form.description.trim().length > 0;
    case "outcomes": {
      const valid = form.outcomes.filter(
        (o) => o.name.trim() && o.question.trim(),
      );
      const names = valid.map((o) => o.name.trim().toLowerCase());

      return valid.length >= 2 && new Set(names).size === names.length;
    }
    case "settings":
      return form.additionalReward >= 0 && form.placeholderCount >= 0;
    case "review":
      return (
        form.outcomes.filter((o) => o.name.trim() && o.question.trim())
          .length >= 2
      );
  }
}

export function GroupMarketWizard({
  venueId,
  baseUmaReward,
  creationFee,
  onChangeType,
  onClose,
}: GroupMarketWizardProps) {
  const { address } = useConnection();
  const [formData, setFormData] =
    useState<GroupMarketFormData>(DEFAULT_GROUP_FORM);
  const [currentStep, setCurrentStep] = useState<GroupWizardStep>("info");
  const [hasCompleted, setHasCompleted] = useState(false);
  const [flowOpen, setFlowOpen] = useState(false);

  const creation = useGroupMarketCreation(venueId);

  const updateField = useCallback(
    <K extends keyof GroupMarketFormData>(
      key: K,
      value: GroupMarketFormData[K],
    ) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const stepIndex = GROUP_WIZARD_STEPS.findIndex((s) => s.id === currentStep);
  const totalSteps = GROUP_WIZARD_STEPS.length;
  const stepInfo = GROUP_WIZARD_STEPS[stepIndex];
  const valid = useMemo(
    () => isStepValid(currentStep, formData),
    [currentStep, formData],
  );

  const goNext = useCallback(() => {
    const next = GROUP_WIZARD_STEPS[stepIndex + 1];

    if (next) setCurrentStep(next.id);
  }, [stepIndex]);

  const goBack = useCallback(() => {
    const prev = GROUP_WIZARD_STEPS[stepIndex - 1];

    if (prev) setCurrentStep(prev.id);
  }, [stepIndex]);

  const submit = useCallback(() => {
    if (!address) return;
    setHasCompleted(true);
    setFlowOpen(true);
    creation.createGroup(formData, address);
  }, [address, creation, formData]);

  const reset = useCallback(() => {
    setFormData(DEFAULT_GROUP_FORM);
    setCurrentStep("info");
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
        marketType="group"
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
        submitLabel={
          formData.activateImmediately ? "Create & activate" : "Create group"
        }
        totalSteps={totalSteps}
        onBack={goBack}
        onNext={goNext}
        onSubmit={submit}
      >
        {currentStep === "info" && (
          <StepGroupInfo formData={formData} updateField={updateField} />
        )}
        {currentStep === "outcomes" && (
          <StepGroupOutcomes formData={formData} updateField={updateField} />
        )}
        {currentStep === "settings" && (
          <StepGroupSettings
            baseUmaReward={baseUmaReward}
            formData={formData}
            updateField={updateField}
          />
        )}
        {currentStep === "review" && (
          <StepGroupReview
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
        title="Create market group"
        onClose={handleFlowClose}
        onRetry={creation.retry}
      />
    </>
  );
}
