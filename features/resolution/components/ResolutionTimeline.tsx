"use client";

import type { ResolutionPhase } from "../hooks/useMarketStatus";

import {
  CheckCircleIcon,
  CircleIcon,
  ErrorCircleIcon,
} from "@/components/icons";

interface ResolutionTimelineProps {
  phase: ResolutionPhase;
  assertedOutcome: string | null;
  isDisputed: boolean;
  winningOutcome: string | null;
}

type StepStatus = "completed" | "current" | "pending" | "disputed";

interface TimelineStep {
  label: string;
  status: StepStatus;
}

function deriveSteps(
  phase: ResolutionPhase,
  assertedOutcome: string | null,
  isDisputed: boolean,
  winningOutcome: string | null,
): TimelineStep[] {
  if (phase === "ACTIVE_NO_ASSERTION") return [];

  const outcomeLabel = `Outcome proposed: ${assertedOutcome || "?"}`;

  // Disputed assertions follow a different path: they escalate to UMA's DVM.
  // The third step reflects DVM progress — once `settleAssertion` becomes
  // callable (phase advances past ASSERTION_PENDING) the DVM has resolved.
  if (isDisputed && phase !== "RESOLVED") {
    let dvmLabel: string;
    let dvmStatus: StepStatus;

    if (phase === "ASSERTION_PENDING") {
      dvmLabel = "Awaiting DVM resolution";
      dvmStatus = "current";
    } else {
      // ASSERTION_EXPIRED or SETTLED_NOT_REPORTED — DVM has returned a price.
      dvmLabel = "DVM resolved";
      dvmStatus = "completed";
    }

    return [
      { label: outcomeLabel, status: "completed" },
      { label: "Disputed — escalated to UMA DVM", status: "disputed" },
      { label: dvmLabel, status: dvmStatus },
      {
        label: "Final",
        status: dvmStatus === "completed" ? "current" : "pending",
      },
    ];
  }

  let disputeLabel: string;
  let disputeStatus: StepStatus;
  let finalLabel: string;
  let finalStatus: StepStatus;

  switch (phase) {
    case "ASSERTION_PENDING":
      disputeLabel = "Dispute window";
      disputeStatus = "current";
      finalLabel = "Final";
      finalStatus = "pending";
      break;
    case "ASSERTION_EXPIRED":
    case "SETTLED_NOT_REPORTED":
      disputeLabel = "No dispute";
      disputeStatus = "completed";
      finalLabel = "Final";
      finalStatus = "pending";
      break;
    case "RESOLVED":
      disputeLabel = isDisputed ? "Disputed — DVM ruled" : "No dispute";
      disputeStatus = "completed";
      finalLabel = `Final outcome: ${winningOutcome || "?"}`;
      finalStatus = "completed";
      break;
    default:
      return [];
  }

  return [
    { label: outcomeLabel, status: "completed" },
    { label: disputeLabel, status: disputeStatus },
    { label: finalLabel, status: finalStatus },
  ];
}

function StepCircle({ status }: { status: StepStatus }) {
  if (status === "completed") {
    return <CheckCircleIcon className="text-primary" size={20} />;
  }
  if (status === "disputed") {
    return <ErrorCircleIcon className="text-secondary" size={20} />;
  }

  return (
    <CircleIcon
      className={status === "current" ? "text-primary" : "text-default-300"}
      size={20}
    />
  );
}

function stepTextClass(status: StepStatus): string {
  switch (status) {
    case "completed":
      return "text-primary";
    case "disputed":
      return "text-secondary font-medium";
    case "current":
      return "text-foreground";
    default:
      return "text-default-400";
  }
}

function connectorClass(prevStatus: StepStatus): string {
  if (prevStatus === "completed") return "bg-primary";
  if (prevStatus === "disputed") return "bg-secondary";

  return "bg-default-200";
}

export function ResolutionTimeline({
  phase,
  assertedOutcome,
  isDisputed,
  winningOutcome,
}: ResolutionTimelineProps) {
  const steps = deriveSteps(phase, assertedOutcome, isDisputed, winningOutcome);

  if (steps.length === 0) return null;

  return (
    <div className="flex flex-col gap-0">
      {steps.map((step, i) => (
        <div key={i}>
          {i > 0 && (
            <div className="flex ml-[9px]">
              <div
                className={`w-0.5 h-4 ${connectorClass(steps[i - 1].status)}`}
              />
            </div>
          )}
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <StepCircle status={step.status} />
            </div>
            <span className={`text-sm ${stepTextClass(step.status)}`}>
              {step.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
