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
        className={cns(styles.popup, !!map?.length && styles.popup__hovered)}
      >
        {map && (
          <>
            {map.map(({ title, url, files }) => (
              <div key={title} className={styles.prFiles}>
                <a href={url} target="_blank" rel="noreferrer">
                  <Text as="h5">{title}</Text>
                </a>
                <ul className={styles.list}>
                  {files.map((file) => (
                    <Text as="li" key={file}>
                      {file.filename}
                    </Text>
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
