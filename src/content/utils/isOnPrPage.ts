import { Settings } from "../../services";
import { urls } from "./urls";

export function isOnPrPage(settings: Settings) {
  return window.location.href.includes(urls(settings).urlUiPr);
}
