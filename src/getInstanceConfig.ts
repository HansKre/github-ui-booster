import { getUrlUiBase } from "./content/utils/urls";
import { InstanceConfig, Settings } from "./services";

export function getInstanceConfig(
  settings: Settings
): InstanceConfig | undefined {
  const instance = settings.instances.find(({ ghBaseUrl }) =>
    window.location.href.includes(getUrlUiBase(ghBaseUrl))
  );
  if (!instance) return undefined;

  const org = getCurrent(instance.org);

  if (!org) return undefined;

  const repo = getCurrent(instance.repo);

  if (!repo) return undefined;

  const instanceConfig = {
    ...instance,
    org,
    repo,
  };

  return instanceConfig;
}

function getCurrent(value: string) {
  return split(value).find((value) =>
    window.location.href.includes(`/${value}`)
  );
}

function split(value: string): string[] {
  return value
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}
