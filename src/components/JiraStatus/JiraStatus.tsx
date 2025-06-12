import { Link, Tooltip } from "@primer/react";
import React from "react";
import { cns } from "ts-type-safe";
import styles from "./JiraStatus.module.scss";

type Props = {
  result: { status: string; priority: string; assignee: string };
  issueKey: string;
};

export const JiraStatus: React.FC<Props> = ({ result, issueKey }) => {
  const { status, priority, assignee } = result;
  return (
    <Tooltip
      text={`priority: ${priority}, assignee: ${assignee}`}
      direction="s"
      sx={{
        "&::after": {
          backgroundColor: "black",
          padding: "1rem",
        },
      }}
    >
      <Link
        href={`https://mbb-jira.mercedes-benz.polygran.de/browse/${issueKey}`}
        className={cns(
          styles.statusBadge,
          status === "Code Review" && styles.statusBadge__codeReview,
          status === "In Progress" && styles.statusBadge__inProgress,
          (["Resolved", "Closed"].includes(status) ||
            status.toLowerCase().includes("installed") ||
            status.toLowerCase().includes("tested")) &&
            styles.statusBadge__done,
        )}
        target="_blank"
      >
        {status}
      </Link>
    </Tooltip>
  );
};
