import { RestEndpointMethodTypes } from "@octokit/rest";
import { Text } from "@primer/react";
import React, { useState } from "react";
import { cns } from "ts-type-safe";
import { Search } from "../Search";

import styles from "./PrFilesSearch.module.scss";

export type Files =
  RestEndpointMethodTypes["pulls"]["listFiles"]["response"]["data"];

type PrWithFiles = {
  title: string;
  url: string;
  files: Files;
};

type Props = {
  prs: RestEndpointMethodTypes["pulls"]["list"]["response"]["data"];
  prFilesMap: Map<number, Files>;
};

export const PrFilesSearch: React.FC<Props> = ({ prs, prFilesMap }) => {
  const [map, mapSet] = useState<PrWithFiles[]>();
  const [open, openSet] = useState<string>();

  return (
    <>
      <Search
        label="Search for file in PRs"
        name="search"
        onChange={(value) => {
          if (value.trim() === "") {
            mapSet(undefined);
            return;
          }

          const matchingMap: PrWithFiles[] = [];

          prFilesMap.forEach((files, prNumber) => {
            const matchingFiles = files.filter((file) =>
              file.filename.toLowerCase().includes(value.toLowerCase())
            );
            if (matchingFiles.length > 0) {
              const prData = prs.find((pr) => pr.number === prNumber);
              if (!prData) return;
              matchingMap.push({
                title: `${prData.number}: ${prData.title}`,
                url: `${prData.html_url}/files`,
                files: matchingFiles,
              });
            }
          });

          mapSet(matchingMap);
        }}
      />
      <div
        className={cns(
          styles.searchPopup,
          !!map?.length && styles.popup__hovered
        )}
      >
        {map && (
          <>
            {map.map(({ title, url, files }) => (
              <div key={title} className={styles.prFiles}>
                <a href={url} target="_blank" rel="noreferrer">
                  <Text as="h5">{title}</Text>
                </a>
                <ul className={styles.list}>
                  {files.map((file, index) => (
                    <React.Fragment key={file.filename}>
                      <Text
                        as="li"
                        onMouseEnter={() => openSet(getKey(title, index))}
                        onMouseLeave={() => openSet(undefined)}
                      >
                        {file.filename}
                      </Text>
                      {/* only text-based files have a patch */}
                      {file.patch && (
                        <div
                          className={cns(
                            styles.popup,
                            open === getKey(title, index) &&
                              styles.popup__hovered
                          )}
                        >
                          <pre>
                            <code>{formatPatch(file.patch)}</code>
                          </pre>
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </ul>
              </div>
            ))}
          </>
        )}
      </div>
    </>
  );
};
function getKey(title: string, index: number) {
  return `${title}-${index}`;
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
