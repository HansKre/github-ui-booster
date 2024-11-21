import { InstanceConfig } from "../../services";
import { urls } from "./urls";

export function isOnPrPage(instanceConfig: InstanceConfig) {
  return window.location.href.includes(urls(instanceConfig).urlUiPr);
}
