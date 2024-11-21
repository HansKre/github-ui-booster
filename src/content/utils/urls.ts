import { InstanceConfig } from "../../services";

export function urls({ ghBaseUrl, org, repo }: InstanceConfig) {
  const urlUiBase = `${getUrlUiBase(ghBaseUrl)}/${org}/${repo}`;
  const urlUiPrs = `${urlUiBase}/pulls`;
  const urlUiPr = `${urlUiBase}/pull/`;

  return {
    urlUiBase,
    urlUiPrs,
    urlUiPr,
  };
}

export function getUrlUiBase(ghBaseUrl: string) {
  return ghBaseUrl.replace("/api/v3", "").replace("api.", "");
}
