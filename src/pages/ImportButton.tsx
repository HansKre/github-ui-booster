import { UploadIcon } from "@primer/octicons-react";
import React, { useRef, useState } from "react";
import { Button } from "../popup/Button";
import { persistSettings } from "../services";
import { settingsSchema } from "../services/getSettings";

type Props = {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  onClick?: () => void;
};

export const ImportButton: React.FC<Props> = ({
  onError,
  onSuccess,
  onClick,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, importingSet] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      onError?.("No file selected.");
      return;
    }

    try {
      importingSet(true);
      const text = await file.text();
      const json: unknown = JSON.parse(text);
      const validated = await settingsSchema.validate(json, { strict: true });

      persistSettings({
        values: validated,
        onSuccess,
        onError,
        onSettled: () => importingSet(false),
      });
    } catch (err) {
      onError?.(
        err instanceof Error
          ? err.message
          : "Failed to import settings. Invalid file or format.",
      );
    } finally {
      // Reset input so the same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
      importingSet(false);
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        style={{ display: "none" }}
        onChange={(e) => void handleFileChange(e)}
      />
      <Button
        onClick={() => {
          onClick?.();
          fileInputRef.current?.click();
        }}
        variant="default"
        loading={importing}
        icon={UploadIcon}
      >
        Import Settings
      </Button>
    </>
  );
};
