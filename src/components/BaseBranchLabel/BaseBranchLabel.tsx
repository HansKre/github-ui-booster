import React from "react";
import { RestEndpointMethodTypes } from "@octokit/rest";
import styles from "./BaseBranchLabel.module.scss";
import { CliboardCopy } from "../CliboardCopy";

type PullRequest =
  RestEndpointMethodTypes["pulls"]["list"]["response"]["data"][number];

type Props = {
  currentPr: PullRequest;
  basePr?: PullRequest;
};

export const BaseBranchLabel: React.FC<Props> = ({ currentPr, basePr }) => {
  const baseBranchText = currentPr.base.ref;
  const featureBranchText = currentPr.head.ref;

  return (
    <div className={styles.baseBranchContainer}>
      <span className={styles.branchGroup}>
        {basePr ? (
          <a
            href={basePr.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.baseBranchLink}
          >
            {baseBranchText}
          </a>
        ) : (
          <span className={styles.branchText}>{baseBranchText}</span>
        )}
        <CliboardCopy value={currentPr.base.ref} />
      </span>
      <span className={styles.branchGroup}>
        <span> ← </span>
        <span className={styles.branchText}>{featureBranchText}</span>
        <CliboardCopy value={currentPr.head.ref} />
      </span>
    </div>
  );
};
