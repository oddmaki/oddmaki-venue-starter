"use client";

import type { FormattedMarketGroup } from "../types";

import { useState } from "react";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Divider } from "@heroui/divider";
import { useConnection } from "wagmi";

import {
  useAddMarketToGroup,
  useAddPlaceholders,
  useActivateMarketGroup,
  useActivatePlaceholder,
} from "../hooks/useManageMarketGroup";
import { useGroupMarkets } from "../hooks/useGroupMarkets";

import { TransactionFlowModal } from "@/lib/oddmaki/TransactionFlowModal";

interface MarketGroupManagementPanelProps {
  groupId: string;
  group: FormattedMarketGroup;
}

export function MarketGroupManagementPanel({
  groupId,
  group,
}: MarketGroupManagementPanelProps) {
  const { address } = useConnection();
  const { data: markets } = useGroupMarkets(groupId);

  // Check if current user is the creator
  const isCreator =
    !!address && group.creator.toLowerCase() === address.toLowerCase();

  if (!isCreator) return null;

  const isDraft = group.status === "Draft";
  const isActive = group.status === "Active";
  const placeholders = markets?.filter((m) => m.isPlaceholder) || [];
  const hasPlaceholders = placeholders.length > 0;

  // Nothing to manage for active groups without placeholders, or resolved groups
  if (isActive && !hasPlaceholders) return null;
  if (group.status === "Resolved") return null;

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">Manage Group</h2>
      </CardHeader>
      <CardBody className="gap-4">
        {isDraft && <DraftManagement groupId={groupId} />}
        {isActive && hasPlaceholders && (
          <PlaceholderManagement
            groupId={groupId}
            placeholders={placeholders}
          />
        )}
      </CardBody>
    </Card>
  );
}

function DraftManagement({ groupId }: { groupId: string }) {
  const addMarket = useAddMarketToGroup(groupId);
  const addPlaceholdersHook = useAddPlaceholders(groupId);
  const activateGroup = useActivateMarketGroup(groupId);

  const [marketName, setMarketName] = useState("");
  const [marketQuestion, setMarketQuestion] = useState("");
  const [placeholderCount, setPlaceholderCount] = useState("1");

  // Track which flow modal to show
  const [activeFlow, setActiveFlow] = useState<
    "addMarket" | "addPlaceholders" | "activate" | null
  >(null);

  const handleAddMarket = async () => {
    if (!marketName.trim() || !marketQuestion.trim()) return;
    setActiveFlow("addMarket");
    await addMarket.execute(marketName.trim(), marketQuestion.trim());
    if (addMarket.flow.isComplete) {
      setMarketName("");
      setMarketQuestion("");
    }
  };

  const handleAddPlaceholders = async () => {
    const count = parseInt(placeholderCount);

    if (count < 1) return;
    setActiveFlow("addPlaceholders");
    await addPlaceholdersHook.execute(count);
  };

  const handleActivate = async () => {
    setActiveFlow("activate");
    await activateGroup.execute();
  };

  const handleFlowClose = () => {
    const flow =
      activeFlow === "addMarket"
        ? addMarket.flow
        : activeFlow === "addPlaceholders"
          ? addPlaceholdersHook.flow
          : activateGroup.flow;

    flow.reset();
    setActiveFlow(null);
  };

  const currentFlow =
    activeFlow === "addMarket"
      ? addMarket.flow
      : activeFlow === "addPlaceholders"
        ? addPlaceholdersHook.flow
        : activateGroup.flow;

  if (activeFlow) {
    return (
      <TransactionFlowModal
        hasError={currentFlow.hasError}
        isComplete={currentFlow.isComplete}
        isOpen={true}
        isRunning={currentFlow.isRunning}
        stepStates={currentFlow.stepStates}
        title={
          activeFlow === "addMarket"
            ? "Adding Market"
            : activeFlow === "addPlaceholders"
              ? "Adding Placeholders"
              : "Activating Group"
        }
        onClose={handleFlowClose}
        onRetry={currentFlow.retry}
      />
    );
  }

  return (
    <>
      {/* Add Market */}
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">Add Market</p>
        <Input
          label="Name"
          placeholder="e.g., February 27"
          size="sm"
          value={marketName}
          onValueChange={setMarketName}
        />
        <Input
          label="Question"
          placeholder="e.g., Will the US strike Iran on February 27?"
          size="sm"
          value={marketQuestion}
          onValueChange={setMarketQuestion}
        />
        <Button
          color="primary"
          isDisabled={!marketName.trim() || !marketQuestion.trim()}
          size="sm"
          variant="flat"
          onPress={handleAddMarket}
        >
          Add Market
        </Button>
      </div>

      <Divider />

      {/* Add Placeholders */}
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">Add Placeholders</p>
        <div className="flex gap-2">
          <Input
            className="w-24"
            label="Count"
            max={50}
            min={1}
            size="sm"
            type="number"
            value={placeholderCount}
            onValueChange={setPlaceholderCount}
          />
          <Button
            className="self-end"
            color="secondary"
            size="sm"
            variant="flat"
            onPress={handleAddPlaceholders}
          >
            Add
          </Button>
        </div>
      </div>

      <Divider />

      {/* Activate Group */}
      <Button color="primary" onPress={handleActivate}>
        Activate Market Group
      </Button>
      <p className="text-xs text-default-400">
        Activating locks the total market count and enables trading on all
        non-placeholder markets.
      </p>
    </>
  );
}

function PlaceholderManagement({
  groupId,
  placeholders,
}: {
  groupId: string;
  placeholders: { marketId: string; name: string }[];
}) {
  const activatePlaceholder = useActivatePlaceholder(groupId);

  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [question, setQuestion] = useState("");
  const [flowActive, setFlowActive] = useState(false);

  const handleActivate = async (marketId: string) => {
    if (!name.trim() || !question.trim()) return;
    setFlowActive(true);
    await activatePlaceholder.execute(marketId, name.trim(), question.trim());
    if (activatePlaceholder.flow.isComplete) {
      setActivatingId(null);
      setName("");
      setQuestion("");
    }
  };

  const handleFlowClose = () => {
    activatePlaceholder.flow.reset();
    setFlowActive(false);
  };

  if (flowActive) {
    return (
      <TransactionFlowModal
        hasError={activatePlaceholder.flow.hasError}
        isComplete={activatePlaceholder.flow.isComplete}
        isOpen={true}
        isRunning={activatePlaceholder.flow.isRunning}
        stepStates={activatePlaceholder.flow.stepStates}
        title="Activating Placeholder"
        onClose={handleFlowClose}
        onRetry={activatePlaceholder.flow.retry}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium">
        Placeholders ({placeholders.length})
      </p>
      {placeholders.map((p) => (
        <div
          key={p.marketId}
          className="flex flex-col gap-2 rounded-lg border border-default-200 p-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-default-400">
              Market #{p.marketId}
            </span>
            {activatingId !== p.marketId ? (
              <Button
                color="primary"
                size="sm"
                variant="flat"
                onPress={() => setActivatingId(p.marketId)}
              >
                Activate
              </Button>
            ) : (
              <Button
                size="sm"
                variant="light"
                onPress={() => setActivatingId(null)}
              >
                Cancel
              </Button>
            )}
          </div>
          {activatingId === p.marketId && (
            <>
              <Input
                label="Name"
                placeholder="e.g., March 15"
                size="sm"
                value={name}
                onValueChange={setName}
              />
              <Input
                label="Question"
                placeholder="e.g., Will the US strike Iran by March 15?"
                size="sm"
                value={question}
                onValueChange={setQuestion}
              />
              <Button
                color="primary"
                isDisabled={!name.trim() || !question.trim()}
                size="sm"
                onPress={() => handleActivate(p.marketId)}
              >
                Confirm Activation
              </Button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
