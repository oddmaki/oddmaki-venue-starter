/**
 * CTF (Conditional Tokens Framework) Events ABI
 *
 * The CTF contract emits PositionSplit and PositionsMerge events from its own
 * address (not the Diamond proxy). We watch these separately to detect when
 * users split collateral into outcome tokens or merge them back.
 */

export const ctfEventsAbi = [
  {
    type: "event",
    name: "PositionSplit",
    inputs: [
      { name: "stakeholder", type: "address", indexed: true },
      { name: "collateralToken", type: "address", indexed: false },
      { name: "parentCollectionId", type: "bytes32", indexed: true },
      { name: "conditionId", type: "bytes32", indexed: true },
      { name: "partition", type: "uint256[]", indexed: false },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "PositionsMerge",
    inputs: [
      { name: "stakeholder", type: "address", indexed: true },
      { name: "collateralToken", type: "address", indexed: false },
      { name: "parentCollectionId", type: "bytes32", indexed: true },
      { name: "conditionId", type: "bytes32", indexed: true },
      { name: "partition", type: "uint256[]", indexed: false },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "PayoutRedemption",
    inputs: [
      { name: "redeemer", type: "address", indexed: true },
      { name: "collateralToken", type: "address", indexed: true },
      { name: "parentCollectionId", type: "bytes32", indexed: true },
      { name: "conditionId", type: "bytes32", indexed: false },
      { name: "indexSets", type: "uint256[]", indexed: false },
      { name: "payout", type: "uint256", indexed: false },
    ],
  },
] as const;
