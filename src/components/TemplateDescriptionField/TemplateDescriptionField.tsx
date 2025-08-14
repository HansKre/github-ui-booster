import { Textarea } from "@primer/react";
import React, { useEffect, useState } from "react";
import { getSettingValue } from "../../services";

type Props = {
  onError: (message: string) => void;
};

export const TemplateDescriptionField: React.FC<Props> = ({ onError }) => {
  const [description, setDescription] = useState<string>();

  useEffect(() => {
    const getDescription = async () => {
      const value = await getSettingValue("templateDescription");
      setDescription(value);
    };
    void getDescription();
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      setDescription(event.target.value);
      chrome.storage.local.set(
        { templateDescription: event.target.value },
        () => {
          if (chrome.runtime.lastError?.message) {
            onError(chrome.runtime.lastError.message);
          }
        },
      );
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
      placeholder="Enter template description"
      value={description}
      onChange={handleChange}
      aria-label="Template Description"
    />
  );
};
