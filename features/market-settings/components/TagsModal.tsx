"use client";

import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Chip } from "@heroui/chip";

import { useUpdateMarketTags } from "../hooks/useUpdateMarketTags";

interface TagsModalProps {
  isOpen: boolean;
  onClose: () => void;
  marketId: string;
}

const MAX_TAGS = 5;

export function TagsModal({ isOpen, onClose, marketId }: TagsModalProps) {
  const [tags, setTags] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const { updateTags, isLoading } = useUpdateMarketTags(marketId);

  const addTag = () => {
    const tag = input.trim().toLowerCase();

    if (!tag || tags.length >= MAX_TAGS || tags.includes(tag)) return;
    setTags([...tags, tag]);
    setInput("");
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const handleSubmit = async () => {
    const hash = await updateTags(tags);

    if (hash) {
      onClose();
      setTags([]);
      setInput("");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>Update Market Tags</ModalHeader>
        <ModalBody>
          <p className="text-sm text-default-500 mb-2">
            Tags help categorize your market. Max {MAX_TAGS} tags. This replaces
            all existing tags.
          </p>

          <div className="flex gap-2">
            <Input
              isDisabled={tags.length >= MAX_TAGS}
              placeholder="Add a tag..."
              size="sm"
              value={input}
              onKeyDown={handleKeyDown}
              onValueChange={setInput}
            />
            <Button
              isDisabled={!input.trim() || tags.length >= MAX_TAGS}
              size="sm"
              variant="flat"
              onPress={addTag}
            >
              Add
            </Button>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {tags.map((tag) => (
                <Chip
                  key={tag}
                  size="sm"
                  variant="flat"
                  onClose={() => removeTag(tag)}
                >
                  {tag}
                </Chip>
              ))}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button
            color="primary"
            isDisabled={tags.length === 0}
            isLoading={isLoading}
            onPress={handleSubmit}
          >
            Update Tags
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
