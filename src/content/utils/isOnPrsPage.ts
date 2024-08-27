import { Settings } from "../../services";
import { urls } from "./urls";

export function isOnPrsPage(settings: Settings) {
  return window.location.href.includes(urls(settings).urlUiPrs);
}
