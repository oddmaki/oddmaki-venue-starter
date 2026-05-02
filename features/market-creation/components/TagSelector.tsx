"use client";

import { Chip } from "@heroui/chip";

import { SUGGESTED_TAGS, MAX_TAGS } from "@/config/tags.config";

interface TagSelectorProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
}

export function TagSelector({
  selectedTags,
  onChange,
  maxTags = MAX_TAGS,
}: TagSelectorProps) {
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter((t) => t !== tag));
    } else if (selectedTags.length < maxTags) {
      onChange([...selectedTags, tag]);
    }
  };

  const atLimit = selectedTags.length >= maxTags;

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-default-700">
        Tags{" "}
        <span className="text-default-400 font-normal">
          ({selectedTags.length}/{maxTags})
        </span>
      </label>
      <div className="flex flex-wrap gap-2">
        {SUGGESTED_TAGS.map((tag) => {
          const isSelected = selectedTags.includes(tag);

          return (
            <Chip
              key={tag}
              className="cursor-pointer select-none"
              color={isSelected ? "primary" : "default"}
              isDisabled={!isSelected && atLimit}
              variant={isSelected ? "solid" : "bordered"}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </Chip>
          );
        })}
      </div>
    </div>
  );
}
