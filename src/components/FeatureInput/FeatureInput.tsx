import { Textarea } from "@primer/react";
import React, { useEffect, useState } from "react";
import { getSettingValue, Settings } from "../../services";

type Props = {
  storageKey: keyof Settings;
  placeholder: string;
  ariaLabel?: string;
  onError: (message: string) => void;
};

export const FeatureInput: React.FC<Props> = ({
  storageKey,
  onError,
  ariaLabel,
  placeholder,
}) => {
  const [value, setValue] = useState<string>();

  useEffect(() => {
    const getValue = async () => {
      const value = await getSettingValue(storageKey);
      if (typeof value === "string") setValue(value);
    };
    void getValue();
  }, [storageKey]);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      setValue(event.target.value);
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
      value={value}
      onChange={handleChange}
      aria-label={ariaLabel}
    />
  );
};
