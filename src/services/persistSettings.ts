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
  const useSync = values.features.persistToUserProfile;
  const storage = useSync ? chrome.storage.sync : chrome.storage.local;

  const promises = Object.entries(values).map(([key, value]) => {
    return storage.set({
      [key]: value,
    });
  });

  Promise.all(promises)
    .then(() => {
      // If switching to sync, also save to local as backup
      // If switching to local, also clear sync to prevent confusion
      if (useSync) {
        // Always keep a local backup when using sync
        const localPromises = Object.entries(values).map(([key, value]) => {
          return chrome.storage.local.set({
            [key]: value,
          });
        });
        return Promise.all(localPromises).then(() => void 0);
      } else {
        // Clear sync storage when switching back to local
        return chrome.storage.sync.clear();
      }
    })
    .then(onSuccess)
    .catch(() => onError?.("Couldn't save"))
    .finally(onSettled);
}
