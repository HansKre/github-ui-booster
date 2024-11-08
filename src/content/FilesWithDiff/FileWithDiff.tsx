import { Text } from "@primer/react";
import React, { useState } from "react";
import { cns } from "ts-type-safe";
import { Files } from "../types";
import styles from "./FileWithDiff.module.scss";

type Props = {
  prTitle: string;
  file: Files[number];
  index: number;
};

export const FileWithDiff: React.FC<Props> = ({ file, prTitle, index }) => {
  const [open, openSet] = useState<string>();
  return (
    <>
      <Text
        as="li"
        onMouseEnter={() => openSet(getKey(prTitle, index))}
        onMouseLeave={() => openSet(undefined)}
      >
        {file.filename}
      </Text>
      {/* only text-based files have a patch */}
      {file.patch && (
        <div
          className={cns(
            styles.popupContainer,
            open === getKey(prTitle, index) && styles.popupContainer__hovered
          )}
        >
          <div className={styles.popupContent}>
            <pre>
              <code>{formatPatch(file.patch)}</code>
            </pre>
          </div>
        </div>
      )}
    </>
  );
};

function getKey(prTitle: string, index: number) {
  return `${prTitle}-${index}`;
}

// Function to escape HTML and highlight patch content
const formatPatch = (patch: string | undefined) => {
  if (!patch) return;

  // Split lines and wrap each in appropriate JSX with highlights
  return patch.split("\n").map((line, index) => {
    if (line.startsWith("@@")) {
      // Separate the metadata and code parts on the line
      const [, metadata, code] = line.split("@@ ");
      return (
        <React.Fragment key={index}>
          {/* Display metadata part */}
          <div className={styles.metadata}>{metadata}</div>
          {/* Display code part (if it exists) on a new line */}
          {code ? <div>{code}</div> : null}
        </React.Fragment>
      );
    } else if (line.startsWith("+")) {
      // Added line
      return (
        <div key={index} className={styles.added}>
          {line}
        </div>
      );
    } else if (line.startsWith("-")) {
      // Removed line
      return (
        <div key={index} className={styles.removed}>
          {line}
        </div>
      );
    } else {
      // Regular code line
      return <div key={index}>{line}</div>;
    }
  });
};
