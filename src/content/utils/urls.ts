import { InstanceConfig } from "../../services";

export function urls({ ghBaseUrl, org, repo }: InstanceConfig) {
  const urlUiBase = `${getUrlUiBase(ghBaseUrl)}/${org}/${repo}`;
  const urlUiPrs = `${urlUiBase}/pulls`;
  const urlUiPr = `${urlUiBase}/pull/`;
  const urlUiCompare = `${urlUiBase}/compare`;

  return {
    urlUiBase,
    urlUiPrs,
    urlUiPr,
    urlUiCompare,
  };
}

export function getUrlUiBase(ghBaseUrl: string) {
  return ghBaseUrl.replace("/api/v3", "").replace("api.", "");
}
