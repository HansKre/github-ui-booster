import { InstanceConfig } from "../../services";
import { urls } from "./urls";

export function isOnPrsPage(instanceConfig: InstanceConfig) {
  return window.location.href.includes(urls(instanceConfig).urlUiPrs);
}
