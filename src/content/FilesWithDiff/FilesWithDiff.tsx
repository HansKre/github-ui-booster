import React from "react";
import { Files } from "../types";
import { FileWithDiff } from "./FileWithDiff";

type Props = {
  prTitle?: string;
  files: Files;
};

export const FilesWithDiff: React.FC<Props> = ({
  files,
  prTitle = "dummy",
}) => {
  return (
    <>
      {files.map((file, index) => (
        <FileWithDiff key={index} prTitle={prTitle} file={file} index={index} />
      ))}
    </>
  );
};
