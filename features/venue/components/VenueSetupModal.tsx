'use client';

import { useState, useCallback } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@heroui/modal';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Select, SelectItem } from '@heroui/select';
import { useConnection, usePublicClient } from 'wagmi';
import { parseUnits, parseEther, parseEventLogs } from 'viem';
import { ConnectButton } from '@/features/auth';
import { VenueFacetABI } from '@oddmaki-protocol/sdk';
import { Textarea } from '@heroui/input';
import { useOddMakiClient } from '@/lib/oddmaki/hooks';
import { uploadToIPFS } from '@/lib/ipfs';
import type { VenueMetadata } from '@oddmaki-protocol/sdk';
import { useDeployAccessControl, AccessControlTypeSelector } from '@/features/access-control';
import type { AccessControlType } from '@/features/access-control';
import { USDC_DECIMALS } from '@/lib/oddmaki/constants';
import { useTransactionFlow } from '@/lib/oddmaki/useTransactionFlow';
import type { FlowStep } from '@/lib/oddmaki/useTransactionFlow';
import { TransactionFlowModal } from '@/lib/oddmaki/TransactionFlowModal';
import { queryKeys } from '@/lib/oddmaki/queryKeys';

/**
 * Venue setup modal shown when NEXT_PUBLIC_VENUE_ID is not configured.
 * Allows creating a new venue, then displays the ID for the developer
 * to set in .env.local and restart the app.
 */
export function VenueSetupModal() {
  const { address } = useConnection();
  const publicClient = usePublicClient();
  const client = useOddMakiClient();

  // Created venue ID — when set, show success state
  const [createdVenueId, setCreatedVenueId] = useState<bigint | null>(null);
  const [copied, setCopied] = useState(false);

  // Create form state
  const [venueName, setVenueName] = useState('');
  const [venueUrl, setVenueUrl] = useState('');
  const [venueDescription, setVenueDescription] = useState('');
  const [venueFeeBps, setVenueFeeBps] = useState('50');
  const [tickSize, setTickSize] = useState('0.01');
  const [createFormError, setCreateFormError] = useState('');
  const [flowOpen, setFlowOpen] = useState(false);

  // Access control state
  const [tradingACType, setTradingACType] = useState<AccessControlType>('public');
  const [creationACType, setCreationACType] = useState<AccessControlType>('public');
  const [tradingCustomAddress, setTradingCustomAddress] = useState('');
  const [creationCustomAddress, setCreationCustomAddress] = useState('');
  const [tradingNftContract, setTradingNftContract] = useState('');
  const [tradingNftTokenId, setTradingNftTokenId] = useState('0');
  const [tradingTokenContract, setTradingTokenContract] = useState('');
  const [tradingTokenMinBalance, setTradingTokenMinBalance] = useState('');
  const [creationNftContract, setCreationNftContract] = useState('');
  const [creationNftTokenId, setCreationNftTokenId] = useState('0');
  const [creationTokenContract, setCreationTokenContract] = useState('');
  const [creationTokenMinBalance, setCreationTokenMinBalance] = useState('');
  const { deployWhitelist, deployNFTGated, deployTokenGated } = useDeployAccessControl();

  const flow = useTransactionFlow({
    invalidateKeys: [queryKeys.venue.all],
  });

  const handleCreate = useCallback(async () => {
    setCreateFormError('');
    if (!venueName.trim()) {
      setCreateFormError('Venue name is required');
      return;
    }
    if (!address || !publicClient) return;

    const feeBps = parseInt(venueFeeBps, 10);
    if (isNaN(feeBps) || feeBps < 1 || feeBps > 200) {
      setCreateFormError('Fee must be between 1 and 200 bps');
      return;
    }

    const creationFee = parseUnits('5', USDC_DECIMALS);

    const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as `0x${string}`;

    const resolveACAddress = async (
      acType: AccessControlType,
      customAddr: string,
      nftAddr: string,
      nftTokenId: string,
      tokenAddr: string,
      tokenMinBal: string,
    ): Promise<`0x${string}`> => {
      switch (acType) {
        case 'public':
          return ZERO_ADDRESS;
        case 'whitelist':
          return deployWhitelist();
        case 'nft-erc721':
          return deployNFTGated({
            nftContract: nftAddr as `0x${string}`,
            isERC1155: false,
            tokenId: BigInt(0),
          });
        case 'nft-erc1155':
          return deployNFTGated({
            nftContract: nftAddr as `0x${string}`,
            isERC1155: true,
            tokenId: BigInt(nftTokenId || '0'),
          });
        case 'token':
          return deployTokenGated({
            token: tokenAddr as `0x${string}`,
            minBalance: parseUnits(tokenMinBal || '0', 18),
          });
        case 'custom':
          return customAddr as `0x${string}`;
        default:
          return ZERO_ADDRESS;
      }
    };

    const needsDeployTrading = tradingACType !== 'public' && tradingACType !== 'custom';
    const needsDeployCreation = creationACType !== 'public' && creationACType !== 'custom';

    let tradingAC = ZERO_ADDRESS;
    let creationAC = ZERO_ADDRESS;

    const steps: FlowStep[] = [];

    if (needsDeployTrading) {
      steps.push({
        id: 'deploy-trading-ac',
        label: `Deploy Trading AC (${tradingACType})`,
        execute: async () => {
          tradingAC = await resolveACAddress(
            tradingACType, tradingCustomAddress,
            tradingNftContract, tradingNftTokenId,
            tradingTokenContract, tradingTokenMinBalance,
          );
        },
      });
    } else {
      tradingAC = tradingACType === 'custom' ? tradingCustomAddress as `0x${string}` : ZERO_ADDRESS;
    }

    if (needsDeployCreation) {
      steps.push({
        id: 'deploy-creation-ac',
        label: `Deploy Creation AC (${creationACType})`,
        execute: async () => {
          creationAC = await resolveACAddress(
            creationACType, creationCustomAddress,
            creationNftContract, creationNftTokenId,
            creationTokenContract, creationTokenMinBalance,
          );
        },
      });
    } else {
      creationAC = creationACType === 'custom' ? creationCustomAddress as `0x${string}` : ZERO_ADDRESS;
    }

    // Build metadata URI if any optional fields are filled
    let metadataURI = '';

    const hasMetadata = venueUrl.trim() || venueDescription.trim();
    if (hasMetadata) {
      steps.push({
        id: 'upload-metadata',
        label: 'Upload Metadata to IPFS',
        execute: async () => {
          const metadata: VenueMetadata = {
            version: 1,
            ...(venueUrl.trim() && { venue_url: venueUrl.trim() }),
            ...(venueDescription.trim() && { description: venueDescription.trim() }),
          };
          metadataURI = await uploadToIPFS(metadata);
        },
      });
    }

    steps.push({
      id: 'create-venue',
      label: 'Create Venue',
      execute: async () => {
        const hash = await client.venue.createVenue({
          name: venueName.trim(),
          metadata: metadataURI,
          tradingAccessControl: tradingAC,
          creationAccessControl: creationAC,
          feeRecipient: address,
          venueFeeBps: feeBps,
          creatorFeeBps: 0,
          defaultTickSize: parseEther(tickSize),
          marketCreationFee: creationFee,
          umaRewardAmount: parseUnits('5', USDC_DECIMALS),   // 5 USDC reward for asserters
          umaMinBond: parseUnits('750', USDC_DECIMALS),     // 750 USDC bond (Polymarket standard)
        });
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        // Parse VenueCreated event to get the actual venue ID
        const logs = parseEventLogs({
          abi: VenueFacetABI,
          logs: receipt.logs,
          eventName: 'VenueCreated',
        });
        const eventArgs = logs[0] as unknown as { args: { venueId: bigint } } | undefined;
        if (!eventArgs) {
          throw new Error('VenueCreated event not found in receipt');
        }
        setCreatedVenueId(eventArgs.args.venueId);
      },
    });

    setFlowOpen(true);
    await flow.start(steps);
  }, [
    address, publicClient, client, venueName, venueFeeBps, tickSize, flow,
    tradingACType, creationACType, tradingCustomAddress, creationCustomAddress,
    tradingNftContract, tradingNftTokenId, tradingTokenContract, tradingTokenMinBalance,
    creationNftContract, creationNftTokenId, creationTokenContract, creationTokenMinBalance,
    deployWhitelist, deployNFTGated, deployTokenGated,
  ]);

  const handleFlowClose = () => {
    setFlowOpen(false);
    flow.reset();
  };

  const envVarLine = createdVenueId !== null
    ? `NEXT_PUBLIC_VENUE_ID=${createdVenueId.toString()}`
    : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(envVarLine);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Success state — venue was created, show the ID
  if (createdVenueId !== null && !flowOpen) {
    return (
      <Modal isOpen isDismissable={false} hideCloseButton size="lg">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h2 className="text-xl font-bold">Venue Created!</h2>
          </ModalHeader>

          <ModalBody className="flex flex-col gap-4">
            <p className="text-default-600">
              Your venue has been created with ID <strong>{createdVenueId.toString()}</strong>.
            </p>

            <div className="flex flex-col gap-2">
              <p className="text-sm text-default-500">
                Add this to your <code className="text-xs bg-default-100 px-1 py-0.5 rounded">.env.local</code> file:
              </p>
              <div className="flex items-center gap-2 bg-default-100 rounded-lg p-3 font-mono text-sm">
                <span className="flex-1 break-all">{envVarLine}</span>
                <Button
                  size="sm"
                  variant="flat"
                  onPress={handleCopy}
                  className="shrink-0"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>

            <p className="text-sm text-default-500">
              Then restart the dev server for the change to take effect.
            </p>
          </ModalBody>

          <ModalFooter />
        </ModalContent>
      </Modal>
    );
  }

  // Create form state
  return (
    <>
      <Modal isOpen={!flowOpen} isDismissable={false} hideCloseButton size="lg">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h2 className="text-xl font-bold">Set Up Your Venue</h2>
            <p className="text-sm text-default-500 font-normal">
              Create a new venue to start displaying markets.
            </p>
          </ModalHeader>

          <ModalBody>
            <div className="bg-default-100 rounded-lg p-3 mb-2">
              <p className="text-sm text-default-600">
                Already have a venue? Set{' '}
                <code className="text-xs bg-default-200 px-1 py-0.5 rounded">
                  NEXT_PUBLIC_VENUE_ID=&lt;your-id&gt;
                </code>{' '}
                in your <code className="text-xs bg-default-200 px-1 py-0.5 rounded">.env.local</code>{' '}
                and restart the app.
              </p>
            </div>

            {!address ? (
              <div className="flex flex-col items-center gap-4 py-6">
                <p className="text-default-500 text-center">
                  Connect your wallet first to create a venue.
                </p>
                <ConnectButton />
              </div>
            ) : (
              <div className="flex flex-col gap-4 pt-2">
                <Input
                  label="Venue Name"
                  placeholder="My Prediction Market"
                  value={venueName}
                  onValueChange={(v) => {
                    setVenueName(v);
                    setCreateFormError('');
                  }}
                  isRequired
                />
                <Input
                  label="Venue URL"
                  placeholder="https://yoursite.com"
                  description="Optional. Your project or venue website URL."
                  value={venueUrl}
                  onValueChange={setVenueUrl}
                />
                <Textarea
                  label="Description"
                  placeholder="A brief description of your venue..."
                  description="Optional. Describe what your venue is about."
                  value={venueDescription}
                  onValueChange={setVenueDescription}
                  minRows={2}
                  maxRows={4}
                />
                <Input
                  label="Venue Fee (bps)"
                  placeholder="50"
                  description="Trading fee in basis points (1-200). 50 bps = 0.5%."
                  value={venueFeeBps}
                  onValueChange={(v) => {
                    setVenueFeeBps(v);
                    setCreateFormError('');
                  }}
                  type="number"
                />
                <Select
                  label="Default Tick Size"
                  selectedKeys={[tickSize]}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    if (selected) setTickSize(selected);
                  }}
                  size="sm"
                  description={tickSize === '0.01' ? '100 price levels (standard)' : '1,000 price levels (fine)'}
                >
                  <SelectItem key="0.01">$0.01 (1%)</SelectItem>
                  <SelectItem key="0.001">$0.001 (0.1%)</SelectItem>
                </Select>
                <AccessControlTypeSelector
                  label="Trading Access Control"
                  value={tradingACType}
                  onChange={setTradingACType}
                  customAddress={tradingCustomAddress}
                  onCustomAddressChange={setTradingCustomAddress}
                  nftContract={tradingNftContract}
                  onNftContractChange={setTradingNftContract}
                  nftTokenId={tradingNftTokenId}
                  onNftTokenIdChange={setTradingNftTokenId}
                  tokenContract={tradingTokenContract}
                  onTokenContractChange={setTradingTokenContract}
                  tokenMinBalance={tradingTokenMinBalance}
                  onTokenMinBalanceChange={setTradingTokenMinBalance}
                />
                <AccessControlTypeSelector
                  label="Market Creation Access Control"
                  value={creationACType}
                  onChange={setCreationACType}
                  customAddress={creationCustomAddress}
                  onCustomAddressChange={setCreationCustomAddress}
                  nftContract={creationNftContract}
                  onNftContractChange={setCreationNftContract}
                  nftTokenId={creationNftTokenId}
                  onNftTokenIdChange={setCreationNftTokenId}
                  tokenContract={creationTokenContract}
                  onTokenContractChange={setCreationTokenContract}
                  tokenMinBalance={creationTokenMinBalance}
                  onTokenMinBalanceChange={setCreationTokenMinBalance}
                />
                {createFormError && (
                  <p className="text-danger text-sm">{createFormError}</p>
                )}
                <Button
                  color="primary"
                  onPress={handleCreate}
                  isDisabled={!venueName.trim()}
                >
                  Create Venue
                </Button>
                <p className="text-xs text-default-400">
                  Creating a venue is free. Markets created in this venue will charge a 5 USDC creation fee.
                </p>
              </div>
            )}
          </ModalBody>

          <ModalFooter />
        </ModalContent>
      </Modal>

      <TransactionFlowModal
        isOpen={flowOpen}
        onClose={handleFlowClose}
        title="Create Venue"
        stepStates={flow.stepStates}
        isRunning={flow.isRunning}
        isComplete={flow.isComplete}
        hasError={flow.hasError}
        onRetry={flow.retry}
      />
    </>
  );
}
