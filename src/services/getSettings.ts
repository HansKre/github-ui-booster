import { DeepKeysOf } from "ts-type-safe";
import { array, boolean, InferType, object, string } from "yup";

const autoFilterSchema = object({
  filter: string().optional(),
});

export type AutoFilter = InferType<typeof autoFilterSchema>;

const instanceConfigSchema = object({
  pat: string().required().matches(/^ghp_/, "Should start with ghp_").min(30),
  org: string().required(),
  repo: string().required(),
  ghBaseUrl: string().required().url(),
});

const featuresSchema = object({
  baseBranchLabels: boolean().default(true),
  changedFiles: boolean().default(true),
  totalLines: boolean().default(true),
  reOrderPrs: boolean().default(true),
  addUpdateBranchButton: boolean().default(true),
  autoFilter: boolean().default(false),
  jira: boolean().default(false),
});

const jiraSchema = object({
  pat: string().required().min(30),
  baseUrl: string().required().url(),
  issueKeyRegex: string().required(),
});

export const settingsSchema = object({
  instances: array(instanceConfigSchema).required(),
  autoFilter: autoFilterSchema,
  features: featuresSchema,
  jira: jiraSchema.optional(),
});

export type InstanceConfig = InferType<typeof instanceConfigSchema>;
export type Features = InferType<typeof featuresSchema>;
export type Settings = InferType<typeof settingsSchema>;
export type SettingName = DeepKeysOf<Settings>;

export const INITIAL_VALUES: Settings = {
  instances: [
    { pat: "", org: "", repo: "", ghBaseUrl: "https://api.github.com" },
  ],
  jira: { pat: "", baseUrl: "", issueKeyRegex: "" },
  autoFilter: { filter: "" },
  features: {
    baseBranchLabels: true,
    changedFiles: true,
    totalLines: true,
    reOrderPrs: true,
    addUpdateBranchButton: true,
    autoFilter: false,
    jira: false,
  },
};

type Params = {
  onSuccess: (settings: Settings) => void | Promise<void>;
  onError: () => void;
};

export function getSettings({ onSuccess, onError }: Params) {
  chrome.storage.local
    .get(Object.keys(settingsSchema.fields))
    .then((entries) => {
      if (Object.keys(entries).length === 0) {
        void onSuccess(INITIAL_VALUES);
      } else {
        settingsSchema
          .validate(entries, { strict: true })
          .then((settings) => onSuccess(settings))
          .catch((e) => {
            console.error(e);
            onError();
          });
      }
    })
    .catch(onError);
}
