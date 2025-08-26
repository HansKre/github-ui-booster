import React from "react";
import { RestEndpointMethodTypes } from "@octokit/rest";
import styles from "./BaseBranchLabel.module.scss";

type PullRequest =
  RestEndpointMethodTypes["pulls"]["list"]["response"]["data"][number];

type Props = {
  currentPr: PullRequest;
  basePr?: PullRequest;
};

export const BaseBranchLabel: React.FC<Props> = ({ currentPr, basePr }) => {
  const baseBranchText = currentPr.base.ref;
  const featureBranchText = ` ← ${currentPr.head.ref}`;

  return (
    <div className={styles.baseBranchContainer}>
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
        <span className={styles.baseBranchText}>{baseBranchText}</span>
      )}
      <span className={styles.featureBranchText}>{featureBranchText}</span>
    </div>
  );
};
