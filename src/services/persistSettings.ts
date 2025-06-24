import { Settings } from "./getSettings";

export function persistSettings({
  values,
  onSuccess,
  onError,
  onSettled,
}: {
  values: Settings;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  onSettled?: () => void;
}) {
  const promises = Object.entries(values).map(([key, value]) => {
    return chrome.storage.local.set({
      [key]: value,
    });
  });
  Promise.all(promises)
    .then(onSuccess)
    .catch(() => onError?.("Couldn't save"))
    .finally(onSettled);
}
