import { RestEndpointMethodTypes } from "@octokit/rest";
import { Text } from "@primer/react";
import React, { useCallback, useMemo, useState, useTransition } from "react";
import { cns } from "ts-type-safe";
import { SearchInput } from "../../components";

import { FilesWithDiff } from "../FilesWithDiff";
import { Files } from "../types";

import styles from "./PrFilesSearch.module.scss";

type PrWithFiles = {
  title: string;
  url: string;
  files: Files;
};

export type Props = {
  prs: RestEndpointMethodTypes["pulls"]["list"]["response"]["data"];
  prFilesMap: Map<number, Files>;
};

export const PrFilesSearch: React.FC<Props> = ({ prs, prFilesMap }) => {
  const allFiles = useMemo(() => {
    const files: PrWithFiles[] = [];
    prFilesMap.forEach((filesData, prNumber) => {
      const prData = prs.find((pr) => pr.number === prNumber);
      if (!prData) return;
      files.push({
        title: `${prData.number}: ${prData.title}`,
        url: `${prData.html_url}/files`,
        files: filesData,
      });
    });
    return files;
  }, [prFilesMap, prs]);

  const [map, mapSet] = useState<PrWithFiles[]>();

  const [, startTransition] = useTransition();
  const filterPrs = useCallback(
    (value: string) =>
      startTransition(() => {
        const terms = value.trim().toLowerCase().split(" ").filter(Boolean);
        if (terms.length === 0) {
          mapSet(allFiles);
          return;
        }

        const matchingMap: PrWithFiles[] = [];

        prFilesMap.forEach((files, prNumber) => {
          // Apply each search term sequentially to narrow down matching files
          const matchingFiles = terms.reduce((currentFiles, term) => {
            return currentFiles.filter((file) =>
              file.filename.toLowerCase().includes(term),
            );
          }, files);

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
      }),
    [prFilesMap, allFiles, prs],
  );

  return (
    <>
      <SearchInput
        label="Search for file in PRs"
        name="search"
        onChange={filterPrs}
        onFocus={(value) => {
          if (value) {
            filterPrs(value);
          } else if (!map) {
            mapSet(allFiles);
          }
        }}
        onBlur={() => {
          mapSet(undefined);
        }}
      />
      <div
        className={cns(
          styles.searchPopupContainer,
          !!map?.length && styles.popupContainer__hovered,
        )}
      >
        <div className={styles.popupContent}>
          {map && (
            <>
              {map.map(({ title, url, files }) => (
                <div key={title} className={styles.prFiles}>
                  <a href={url} target="_blank" rel="noreferrer">
                    <Text as="h5">{title}</Text>
                  </a>
                  <ul className={styles.list}>
                    <FilesWithDiff files={files} prTitle={title} />
                  </ul>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </>
  );
};
