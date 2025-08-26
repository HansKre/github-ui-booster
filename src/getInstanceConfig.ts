import { getUrlUiBase } from "./content/utils/urls";
import { InstanceConfig, Settings } from "./services";

export function getInstanceConfig(
  settings: Settings,
): InstanceConfig | undefined {
  const instance = settings.instances.find(({ ghBaseUrl }) =>
    window.location.href.includes(getUrlUiBase(ghBaseUrl)),
  );
  if (!instance) return undefined;

  // Extract org and repo from current URL
  const urlSegments = window.location.pathname.split("/").filter(Boolean);
  if (urlSegments.length < 2) return undefined;

  const currentOrg = urlSegments[0];
  const currentRepo = urlSegments[1];

  // Check if org matches (including wildcard)
  const org = getCurrentValue(instance.org, currentOrg);
  if (!org) return undefined;

  // Check if repo matches (including wildcard)
  const repo = getCurrentValue(instance.repo, currentRepo);
  if (!repo) return undefined;

  const instanceConfig = {
    ...instance,
    org,
    repo,
  };

  return instanceConfig;
}

function getCurrentValue(
  configValue: string,
  urlValue: string,
): string | undefined {
  const configValues = split(configValue);

  // If wildcard is present, return the current value from URL
  if (configValues.includes("*")) {
    return urlValue;
  }

  // Check if current value matches any configured values
  return configValues.includes(urlValue) ? urlValue : undefined;
}

function split(value: string): string[] {
  return value
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}
