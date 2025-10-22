import { InstanceConfig } from "../../services";
import { urls } from "./urls";

export function isOnPrPage(
  instanceConfig: InstanceConfig,
  location: Location = window.location,
) {
  return location.href.includes(urls(instanceConfig).urlUiPr);
}
