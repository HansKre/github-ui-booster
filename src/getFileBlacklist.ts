import { Settings } from "./services/getSettings";

export function getFileBlacklist(settings: Settings): string[] {
  if (!settings.fileBlacklist) return [];

  return settings.fileBlacklist
    .split(",")
    .map((filename) => filename.trim())
    .filter(Boolean);
}
