import { getUrlUiBase } from "./content/utils/urls";
import { InstanceConfig, Settings } from "./services";

export function getInstanceConfig(
  settings: Settings
): InstanceConfig | undefined {
  const instance = settings.instances.find(({ ghBaseUrl }) =>
    window.location.href.includes(getUrlUiBase(ghBaseUrl))
  );
  if (!instance) return undefined;

  const org = instance.org
    .split(",")
    .find((value) => window.location.href.includes(`/${value}`));

  if (!org) return undefined;

  const repo = instance.repo
    .split(",")
    .find((value) => window.location.href.includes(`/${value}`));

  if (!repo) return undefined;

  const instanceConfig = {
    ...instance,
    org,
    repo,
  };

  return instanceConfig;
}
