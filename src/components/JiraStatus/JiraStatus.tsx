import { Link, Tooltip } from "@primer/react";
import React, { useEffect, useState } from "react";
import { cns } from "ts-type-safe";
import { getSettings, Settings } from "../../services";
import styles from "./JiraStatus.module.scss";

type Props = {
  result: { status: string; priority: string; assignee: string };
  issueKey: string;
};

export const JiraStatus: React.FC<Props> = ({ result, issueKey }) => {
  const [settings, settingsSet] = useState<Settings>();

  useEffect(() => {
    getSettings({
      onSuccess: settingsSet,
    });
  }, []);

  const { status, priority, assignee } = result;

  if (!settings?.jira?.baseUrl) return null;

  return (
    <Tooltip
      text={`priority: ${priority}, assignee: ${assignee}`}
      direction="s"
      className={styles.toolTip}
    >
      <Link
        href={`${settings.jira.baseUrl}/browse/${issueKey}`}
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
