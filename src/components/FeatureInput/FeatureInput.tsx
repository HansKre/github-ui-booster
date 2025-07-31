import { Textarea } from "@primer/react";
import React, { useState } from "react";

type Props = {
  storageKey: string;
  placeholder: string;
  initialValue: string;
  ariaLabel?: string;
  onError: (message: string) => void;
};

export const FeatureInput: React.FC<Props> = ({
  storageKey,
  initialValue,
  onError,
  ariaLabel,
  placeholder,
}) => {
  const [description, setDescription] = useState<string>(initialValue);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      setDescription(event.target.value);
      chrome.storage.local.set({ [storageKey]: event.target.value }, () => {
        if (chrome.runtime.lastError?.message) {
          onError(chrome.runtime.lastError.message);
        }
      });
    } catch (error) {
      onError(
        error instanceof Error
          ? error.message
          : "An error occurred while saving the template description",
      );
    }
  };

  return (
    <Textarea
      placeholder={placeholder}
      value={description}
      onChange={handleChange}
      aria-label={ariaLabel}
    />
  );
};
