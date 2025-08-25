import { Box } from "@primer/react";
import React from "react";
import { Subtitle } from "../../../components";
import { ExportButton, ImportButton } from "../../Button";

type Props = {
  onError: (message?: string) => void;
  onSuccess: (message: string) => void;
  onReset: () => void;
  onLoadSettings: () => void;
};

export const ImportExportTab: React.FC<Props> = ({
  onError,
  onSuccess,
  onReset,
  onLoadSettings,
}) => {
  return (
    <>
      <Subtitle>
        You can export your current settings as a JSON file. Your settings
        contain access tokens. Be careful and make sure to remove your tokens
        before sharing.
      </Subtitle>

      <Box display="grid" gridTemplateColumns="1fr 1fr" sx={{ gap: 4 }}>
        <ExportButton
          onError={onError}
          onSuccess={() => onSuccess("Exported settings successfully")}
          onClick={onReset}
        />
        <ImportButton
          onError={onError}
          onSuccess={() => {
            onLoadSettings();
            onSuccess("Imported settings successfully");
          }}
          onClick={onReset}
        />
      </Box>
    </>
  );
};
