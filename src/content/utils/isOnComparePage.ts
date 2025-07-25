import { InstanceConfig } from "../../services";
import { urls } from "./urls";

export function isOnComparePage(instanceConfig: InstanceConfig): boolean {
  return window.location.href.includes(urls(instanceConfig).urlUiCompare);
}
