import { RestEndpointMethodTypes } from "@octokit/rest";
import { Text } from "@primer/react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { cns } from "ts-type-safe";
import { ClosePopupButton, SearchInput } from "../../components";

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

  const [filter, filterSet] = useState<Set<string>>(new Set());
  const [resultsList, resultsListSet] = useState<PrWithFiles[]>();

  const getMatchingPrs = useCallback(
    // OR: returns PRs that match any of the terms
    // AND: returns PRs that match all of the terms
    (terms: string[], filter: "OR" | "AND") => {
      const matchingMap: PrWithFiles[] = [];

      prFilesMap.forEach((files, prNumber) => {
        const matchingFiles =
          filter === "AND"
            ? terms.reduce((currentFiles, term) => {
                return currentFiles.filter((file) =>
                  file.filename.toLowerCase().includes(term.toLowerCase()),
                );
              }, files)
            : terms.reduce((currentFiles, term) => {
                return currentFiles.concat(
                  files.filter((file) =>
                    file.filename.toLowerCase().includes(term.toLowerCase()),
                  ),
                );
              }, [] as Files);

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
      return matchingMap;
    },
    [prFilesMap, prs],
  );

  const [, startTransition] = useTransition();
  const filterPrsAndSetResultsListTransition = useCallback(
    (value: string) =>
      startTransition(() => {
        const terms = value.trim().toLowerCase().split(" ").filter(Boolean);
        if (terms.length === 0) {
          resultsListSet(allFiles);
          return;
        }

        resultsListSet(getMatchingPrs(terms, "AND"));
      }),
    [getMatchingPrs, allFiles],
  );

  const [prsWithSelectedFiles, prsWithSelectedFilesSet] =
    useState<PrWithFiles[]>();

  useEffect(() => {
    if (!filter.size) {
      prsWithSelectedFilesSet(undefined);
    } else {
      prsWithSelectedFilesSet(getMatchingPrs(Array.from(filter), "OR"));
    }
  }, [filter, getMatchingPrs]);

  return (
    <>
      <SearchInput
        label="Search for file in PRs"
        name="search"
        onChange={filterPrsAndSetResultsListTransition}
        onFocus={(value) => {
          if (value) {
            filterPrsAndSetResultsListTransition(value);
          } else if (!resultsList) {
            resultsListSet(allFiles);
          }
        }}
      />
      <ResultsPopup
        filter={filter}
        filterSet={filterSet}
        resultsList={resultsList}
        resultsListSet={resultsListSet}
        prsWithSelectedFiles={prsWithSelectedFiles}
      />
    </>
  );
};

const ResultsPopup: React.FC<{
  filter: Set<string>;
  filterSet: React.Dispatch<React.SetStateAction<Set<string>>>;
  resultsList: PrWithFiles[] | undefined;
  resultsListSet: React.Dispatch<
    React.SetStateAction<PrWithFiles[] | undefined>
  >;
  prsWithSelectedFiles: PrWithFiles[] | undefined;
}> = ({
  filter,
  filterSet,
  resultsList,
  resultsListSet,
  prsWithSelectedFiles,
}) => (
  <div
    className={cns(
      styles.searchPopupContainer,
      !!resultsList?.length && styles.popupContainer__hovered,
    )}
  >
    <Text as="h4" className={styles.title}>
      Conflicts Planer
    </Text>
    <ClosePopupButton onClick={() => resultsListSet(undefined)} />
    <div className={cns(!!filter.size && styles.card)}>
      <SelectedFilesBadges filter={filter} filterSet={filterSet} />
      <PrsWithSelectedFilesList prsWithSelectedFiles={prsWithSelectedFiles} />
    </div>
    <ResultsList resultsList={resultsList} filterSet={filterSet} />
  </div>
);

const ResultsList: React.FC<{
  resultsList: PrWithFiles[] | undefined;
  filterSet: React.Dispatch<React.SetStateAction<Set<string>>>;
}> = ({ resultsList, filterSet }) =>
  resultsList ? (
    <div className={styles.resultsList}>
      {resultsList.map(({ title, url, files }) => (
        <div key={title} className={styles.prFiles}>
          <PrTitleLink url={url} title={title} />
          <ul className={styles.list}>
            {files.map((file, index) => (
              <li
                key={index}
                onClick={() => {
                  filterSet((prev) => new Set(prev).add(file.filename));
                }}
                className={styles.filename}
              >
                {file.filename}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  ) : null;

const SelectedFilesBadges: React.FC<{
  filter: Set<string>;
  filterSet: React.Dispatch<React.SetStateAction<Set<string>>>;
}> = ({ filter, filterSet }) =>
  filter.size ? (
    <>
      <Text as="h5" className={styles.title}>
        Selected Files
      </Text>
      <ul className={styles.badgeList}>
        {Array.from(filter).map((filename) => (
          <li
            key={filename}
            className={styles.badge}
            onClick={() => {
              filterSet((prev) => {
                const newSet = new Set(prev);
                newSet.delete(filename);
                return newSet;
              });
            }}
          >
            {filename}
          </li>
        ))}
      </ul>
    </>
  ) : null;

const PrTitleLink: React.FC<{ url: string; title: string }> = ({
  url,
  title,
}) => (
  <a href={url} target="_blank" rel="noreferrer">
    <Text as="h5">{title}</Text>
  </a>
);

const PrsWithSelectedFilesList: React.FC<{
  prsWithSelectedFiles: PrWithFiles[] | undefined;
}> = ({ prsWithSelectedFiles }) =>
  prsWithSelectedFiles && prsWithSelectedFiles.length > 0 ? (
    <>
      <Text as="h5" className={styles.title}>
        Prs With Selected Files
      </Text>
      {prsWithSelectedFiles.map(({ title, url }) => (
        <PrTitleLink key={url} url={url} title={title} />
      ))}
    </>
  ) : null;
