import { DeepKeysOf } from "ts-type-safe";
import { array, boolean, InferType, object, string } from "yup";

export const autoFilterSchema = string().optional();

export type AutoFilter = InferType<typeof autoFilterSchema>;

const instanceConfigSchema = object({
  pat: string().required().matches(/^ghp_/, "Should start with ghp_").min(30),
  org: string().required(),
  repo: string().required(),
  ghBaseUrl: string().required().url(),
  randomReviewers: string().default(""),
});

const featuresSchema = object({
  baseBranchLabels: boolean().default(true),
  changedFiles: boolean().default(true),
  totalLinesPrs: boolean().default(true),
  totalLinesPr: boolean().default(true),
  reOrderPrs: boolean().default(true),
  addUpdateBranchButton: boolean().default(true),
  autoFilter: boolean().default(false),
  prTitleFromJira: boolean().default(false),
  descriptionTemplate: boolean().default(false),
  randomReviewer: boolean().default(false),
  persistToUserProfile: boolean().default(false),
});

const jiraSchema = object({
  pat: string().required().min(30),
  baseUrl: string().required().url(),
  issueKeyRegex: string().required(),
});

export const settingsSchema = object({
  instances: array(instanceConfigSchema).required(),
  autoFilter: string().optional(),
  features: featuresSchema,
  jira: jiraSchema.optional(),
  descriptionTemplate: string().optional().default(""),
});

export type InstanceConfig = InferType<typeof instanceConfigSchema>;
export type Features = InferType<typeof featuresSchema>;
export type Settings = InferType<typeof settingsSchema>;
export type SettingName = DeepKeysOf<Settings>;

export const INITIAL_VALUES: Settings = {
  instances: [
    {
      pat: "",
      org: "",
      repo: "",
      ghBaseUrl: "https://api.github.com",
      randomReviewers: "",
    },
  ],
  jira: {
    pat: "Enter your Jira personal access token (at least 30 characters)",
    baseUrl: "https://your-jira-instance.atlassian.net",
    issueKeyRegex: "TEST-\\d+",
  },
  features: {
    baseBranchLabels: true,
    changedFiles: true,
    totalLinesPrs: true,
    totalLinesPr: true,
    reOrderPrs: true,
    addUpdateBranchButton: true,
    autoFilter: false,
    prTitleFromJira: false,
    descriptionTemplate: false,
    randomReviewer: false,
    persistToUserProfile: false,
  },
  descriptionTemplate: "",
};

type Params = {
  onSuccess: (settings: Settings) => void | Promise<void>;
  onError?: (e?: unknown) => void;
};

const defaultOnError = (e?: unknown) => {
  console.error(e);
  alert("Couldn't load or validate your Settings from chrome storage.");
};

export function getSettings({ onSuccess, onError = defaultOnError }: Params) {
  // First try to get from local storage to check if persistToUserProfile is enabled
  chrome.storage.local
    .get(Object.keys(settingsSchema.fields))
    .then((entries) => {
      if (Object.keys(entries).length === 0) {
        void onSuccess(INITIAL_VALUES);
      } else {
        settingsSchema
          .validate(entries, { strict: true })
          .then((settings) => {
            // If persistToUserProfile is enabled, use sync storage
            if (settings.features.persistToUserProfile) {
              void chrome.storage.sync
                .get(Object.keys(settingsSchema.fields))
                .then((syncEntries) => {
                  if (Object.keys(syncEntries).length === 0) {
                    // No sync data, use local settings
                    void onSuccess(settings);
                  } else {
                    void settingsSchema
                      .validate(syncEntries, { strict: true })
                      .then((syncSettings) => onSuccess(syncSettings))
                      .catch((e) => {
                        // Fallback to local if sync validation fails
                        console.warn(
                          "Sync storage validation failed, using local:",
                          e,
                        );
                        void onSuccess(settings);
                      });
                  }
                })
                .catch((e) => {
                  // Fallback to local if sync fails
                  console.warn("Sync storage access failed, using local:", e);
                  void onSuccess(settings);
                });
            } else {
              void onSuccess(settings);
            }
          })
          .catch((e) => {
            onError(e);
          });
      }
    })
    .catch(onError);
}

export async function getSettingValue<K extends keyof Settings>(name: K) {
  return new Promise<Settings[K]>((resolve) => {
    getSettings({
      onSuccess: (settings) => {
        resolve(settings[name]);
      },
      onError: (e) => {
        console.error(e);
      },
    });
  });
}
