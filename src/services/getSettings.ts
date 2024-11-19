import { DeepKeysOf } from "ts-type-safe";
import { array, boolean, InferType, object, string } from "yup";

const autoFilterSchema = object({
  active: boolean().optional(),
  filter: string().optional(),
});

export type AutoFilter = InferType<typeof autoFilterSchema>;

const instanceConfigSchema = object({
  pat: string().required().matches(/^ghp_/, "Should start with ghp_").min(30),
  org: string().required(),
  repo: string().required(),
  ghBaseUrl: string().required().url(),
});

export const settingsSchema = object({
  instances: array(instanceConfigSchema).required(),
  autoFilter: autoFilterSchema,
});

export type InstanceConfig = InferType<typeof instanceConfigSchema>;
export type Settings = InferType<typeof settingsSchema>;

export type SettingName = DeepKeysOf<Settings>;

export const INITIAL_VALUES: Settings = {
  instances: [
    { pat: "", org: "", repo: "", ghBaseUrl: "https://github.com/api/v3" },
  ],
  autoFilter: { filter: "", active: false },
};

type Params = {
  onSuccess: (settings: Settings) => void;
  onError: () => void;
};

export function getSettings({ onSuccess, onError }: Params) {
  chrome.storage.local
    .get(Object.keys(settingsSchema.fields))
    .then((entries) => {
      if (Object.keys(entries).length === 0) {
        onSuccess(INITIAL_VALUES);
      } else {
        settingsSchema
          .validate(entries)
          .then((settings) => onSuccess(settings))
          .catch((e) => {
            console.error(e);
            onError();
          });
      }
    });
}
