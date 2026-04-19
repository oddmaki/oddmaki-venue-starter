'use client';

import { useState } from 'react';
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
import { useQuery } from '@tanstack/react-query';
import { VenueFacetABI } from '@oddmaki-protocol/sdk';
import { useCreateMarket } from '../hooks/useCreateMarket';
import { TransactionFlowModal } from '@/lib/oddmaki/TransactionFlowModal';
import { TagSelector } from './TagSelector';
import { AccessControlTypeSelector } from '@/features/access-control';
import type { AccessControlType } from '@/features/access-control';
import { DIAMOND_ADDRESS } from '@/lib/oddmaki/constants';
import { queryKeys } from '@/lib/oddmaki/queryKeys';
import { getVenueId } from '@/config/venue.config';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

function formatACAddress(addr: string | undefined): string {
  if (!addr || addr === ZERO_ADDRESS) {
    return 'Public (no restrictions)';
  }
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

interface CreateMarketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateMarketModal({ isOpen, onClose }: CreateMarketModalProps) {
  const { startCreateMarket, flow } = useCreateMarket();
  const { address } = useConnection();
  const publicClient = usePublicClient();
  const venueId = getVenueId();

  // Fetch venue data to display current AC and check operator status
  const { data: venue } = useQuery({
    queryKey: queryKeys.venue.detail(venueId?.toString() ?? ''),
    queryFn: async () => {
      if (!publicClient || venueId === undefined) return null;
      return publicClient.readContract({
        address: DIAMOND_ADDRESS,
        abi: VenueFacetABI,
        functionName: 'getVenue',
        args: [venueId],
      });
    },
    enabled: !!publicClient && venueId !== undefined,
    staleTime: 60_000,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const venueData = venue as any;
  const isOperator =
    !!address &&
    !!venueData?.operator &&
    venueData.operator.toLowerCase() === address.toLowerCase();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [tickSize, setTickSize] = useState('0.01');
  const [formError, setFormError] = useState('');
  const [flowActive, setFlowActive] = useState(false);

  // AC override state
  const [tradingACType, setTradingACType] = useState<AccessControlType>('public');
  const [tradingCustomAddress, setTradingCustomAddress] = useState('');
  const [tradingNftContract, setTradingNftContract] = useState('');
  const [tradingNftTokenId, setTradingNftTokenId] = useState('0');
  const [tradingTokenContract, setTradingTokenContract] = useState('');
  const [tradingTokenMinBalance, setTradingTokenMinBalance] = useState('');

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setTags([]);
    setImageFile(null);
    setImagePreview(null);
    setTickSize('0.01');
    setFormError('');
    setTradingACType('public');
    setTradingCustomAddress('');
    setTradingNftContract('');
    setTradingNftTokenId('0');
    setTradingTokenContract('');
    setTradingTokenMinBalance('');
  };

  const handleClose = () => {
    if (!flow.isRunning) {
      resetForm();
      setFlowActive(false);
      flow.reset();
      onClose();
    }
  };

  const handleSubmit = async () => {
    setFormError('');

    if (!title.trim()) {
      setFormError('Market question is required');
      return;
    }
    if (!description.trim()) {
      setFormError('Resolution criteria is required');
      return;
    }

    setFlowActive(true);
    await startCreateMarket({
      title: title.trim(),
      description: description.trim(),
      tags,
      tickSize,
      // Optional image for market metadata
      ...(imageFile ? { imageFile } : {}),
      // AC override params (only if operator selected non-public)
      ...(isOperator && tradingACType !== 'public'
        ? {
            tradingACType,
            tradingCustomAddress,
            tradingNftContract,
            tradingNftTokenId,
            tradingTokenContract,
            tradingTokenMinBalance,
          }
        : {}),
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

  // Show the transaction flow modal when active
  if (flowActive) {
    return (
      <TransactionFlowModal
        isOpen={isOpen}
        onClose={handleFlowClose}
        title="Creating Market"
        stepStates={flow.stepStates}
        isRunning={flow.isRunning}
        isComplete={flow.isComplete}
        hasError={flow.hasError}
        onRetry={flow.retry}
      />
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalContent>
        <ModalHeader>
          <h2 className="text-xl font-bold">Create Market</h2>
        </ModalHeader>

        <ModalBody className="gap-4">
          <Input
            label="Question"
            placeholder="Will BTC reach $100k by end of 2026?"
            value={title}
            onValueChange={(v) => {
              setTitle(v);
              setFormError('');
            }}
            isRequired
          />

          <Input
            label="Resolution Criteria"
            placeholder="Resolves YES if the price of BTC on CoinGecko exceeds $100,000 at any point before January 1, 2027."
            value={description}
            onValueChange={(v) => {
              setDescription(v);
              setFormError('');
            }}
            isRequired
          />

          <TagSelector selectedTags={tags} onChange={setTags} />

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">
              Thumbnail Image
              <span className="text-default-400 font-normal"> (optional)</span>
            </span>
            {imagePreview ? (
              <div className="relative w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Market thumbnail preview"
                  className="w-full h-32 object-cover rounded-lg"
                />
                <Button
                  size="sm"
                  variant="flat"
                  className="absolute top-2 right-2"
                  onPress={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-default-300 rounded-lg cursor-pointer hover:border-default-400 transition-colors">
                <span className="text-sm text-default-400">
                  Click to upload an image
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setImageFile(file);
                      setImagePreview(URL.createObjectURL(file));
                    }
                  }}
                />
              </label>
            )}
          </div>

          <Select
            label="Tick Size"
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

          <div className="flex flex-col gap-1 text-xs text-default-400">
            <p>Outcomes: Yes / No</p>
            <p>Collateral: USDC</p>
            <p>UMA Challenge Period: 2 hours (default)</p>
          </div>

          {/* Trading AC override — only for venue operators */}
          {isOperator && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">Trading Access Control</p>
                <p className="text-xs text-default-400">
                  Venue default: {formatACAddress(venueData?.tradingAccessControl)}
                </p>
                <p className="text-xs text-default-400">
                  Select &quot;Public&quot; to inherit the venue setting, or choose a
                  different type to override for this market only.
                </p>
              </div>
              <AccessControlTypeSelector
                label="Market Trading Access Control"
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
            </div>
          )}

          {formError && (
            <p className="text-danger text-sm">{formError}</p>
          )}
        </ModalBody>

        <ModalFooter>
          <Button variant="flat" onPress={handleClose}>
            Cancel
          </Button>
          <Button
            color="primary"
            onPress={handleSubmit}
            isDisabled={!title.trim() || !description.trim()}
          >
            Create Market
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
