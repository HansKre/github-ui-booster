import React from "react";
import { Button } from "../popup/Button";
import { getSettings } from "../services/getSettings";

type Props = {
  onError?: (error: string) => void;
};
export const ExportBtn = ({ onError }: Props) => {
  const handleDownloadSettings = () => {
    getSettings({
      onSuccess: async (settings) => {
        const json = JSON.stringify(settings, null, 2);
        // Use File System Access API if available
        if ("showSaveFilePicker" in window && window.showSaveFilePicker) {
          try {
            const handle = await window.showSaveFilePicker({
              suggestedName: "github-ui-booster-settings.json",
              types: [
                {
                  description: "JSON file",
                  accept: { "application/json": [".json"] },
                },
              ],
            });
            const writable = await handle.createWritable();
            await writable.write(json);
            await writable.close();
          } catch {
            onError?.("Saving cancelled or failed.");
          }
        } else {
          onError?.("File System Access API is not supported.");
        }
      },
      onError: () => onError?.("Could not load settings for download."),
    });
  };

  return <Button onClick={handleDownloadSettings}>Download Settings</Button>;
};

declare global {
  interface Window {
    showSaveFilePicker?: (
      options?: SaveFilePickerOptions,
    ) => Promise<FileSystemFileHandle>;
  }

  interface SaveFilePickerOptions {
    suggestedName?: string;
    types?: FilePickerAcceptType[];
    excludeAcceptAllOption?: boolean;
  }

  interface FilePickerAcceptType {
    description?: string;
    accept: Record<string, string[]>;
  }
}
