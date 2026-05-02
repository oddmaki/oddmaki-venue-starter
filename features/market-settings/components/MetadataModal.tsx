"use client";

import { useState, useRef } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";

import { useUpdateMarketMetadata } from "../hooks/useUpdateMarketMetadata";

interface MetadataModalProps {
  isOpen: boolean;
  onClose: () => void;
  marketId: string;
}

export function MetadataModal({
  isOpen,
  onClose,
  marketId,
}: MetadataModalProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { updateMetadata, isLoading } = useUpdateMarketMetadata(marketId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!imageFile) return;
    const hash = await updateMetadata(imageFile);

    if (hash) {
      onClose();
      setImageFile(null);
      setPreview(null);
    }
  };

  const handleClose = () => {
    onClose();
    setImageFile(null);
    setPreview(null);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalContent>
        <ModalHeader>Update Market Image</ModalHeader>
        <ModalBody>
          <p className="text-sm text-default-500 mb-3">
            Upload a new image for this market. The image will be stored on
            IPFS.
          </p>

          <input
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            type="file"
            onChange={handleFileChange}
          />

          {preview ? (
            <div className="flex flex-col items-center gap-3">
              <img
                alt="Preview"
                className="w-32 h-32 object-cover rounded-lg"
                src={preview}
              />
              <Button
                size="sm"
                variant="flat"
                onPress={() => fileInputRef.current?.click()}
              >
                Choose Different Image
              </Button>
            </div>
          ) : (
            <Button
              className="w-full"
              variant="bordered"
              onPress={() => fileInputRef.current?.click()}
            >
              Select Image
            </Button>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={handleClose}>
            Cancel
          </Button>
          <Button
            color="primary"
            isDisabled={!imageFile}
            isLoading={isLoading}
            onPress={handleSubmit}
          >
            Upload & Update
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
