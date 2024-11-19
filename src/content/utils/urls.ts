import { InstanceConfig } from "../../services";

export function urls({ ghBaseUrl, org, repo }: InstanceConfig) {
  const urlUiBase = `${ghBaseUrl.replace("/api/v3", "")}/${org}/${repo}`;
  const urlUiPrs = `${urlUiBase}/pulls`;
  const urlUiPr = `${urlUiBase}/pull/`;

  return {
    urlUiBase,
    urlUiPrs,
    urlUiPr,
  };
}
