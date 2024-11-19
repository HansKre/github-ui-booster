import { Settings } from "./services";

export function getInstanceConfig(settings: Settings) {
  return settings.instances.find(({ ghBaseUrl }) =>
    window.location.href.includes(
      ghBaseUrl.replace("/api/v3", "").replace("api.", "")
    )
  );
}
