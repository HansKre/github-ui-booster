import { DeepKeysOf } from "ts-type-safe";
import { array, boolean, InferType, object, string } from "yup";

/**
 * yup-playground with demonstration of difference between
 * .cast() and .validate()
 *
 * https://codesandbox.io/p/devbox/yup-playground-forked-r9yp64?workspaceId=ws_Q3Kknv9N2cCqm5xq41CasL
 */

export const autoFilterSchema = string().optional();

export type AutoFilter = InferType<typeof autoFilterSchema>;

const instanceConfigSchema = object({
  pat: string()
    .required()
    .matches(/^ghp_/, (d) => `${d.path} should start with ghp_`)
    .min(30)
    .trim(),
  org: string().required().min(1).trim(),
  repo: string().required().min(1).trim(),
  ghBaseUrl: string().required().url().trim(),
  randomReviewers: string().default("").trim(),
});

const featuresSchema = object({
  addUpdateBranchButton: boolean().default(true),
  autoFilter: boolean().default(false),
  baseBranchLabels: boolean().default(true),
  changedFiles: boolean().default(true),
  descriptionTemplate: boolean().default(false),
  persistToUserProfile: boolean().default(false),
  prTitleFromJira: boolean().default(false),
  randomReviewer: boolean().default(false),
  reOrderPrs: boolean().default(true),
  totalLinesPr: boolean().default(true),
  totalLinesPrs: boolean().default(true),
});

const jiraSchema = object({
  pat: string().required().min(30),
  baseUrl: string().required().url(),
  issueKeyRegex: string().required(),
});

const FEATURES = {
  addUpdateBranchButton: true,
  autoFilter: false,
  baseBranchLabels: true,
  changedFiles: true,
  descriptionTemplate: false,
  persistToUserProfile: false,
  prTitleFromJira: false,
  randomReviewer: false,
  reOrderPrs: true,
  totalLinesPr: true,
  totalLinesPrs: true,
};

const FILE_BLACKLIST = "package-lock.json,pnpm-lock.yaml,yarn.lock";

export const settingsSchema = object({
  instances: array(instanceConfigSchema).optional(),
  autoFilter: string().optional(),
  // will use the default if value is undefined when parsing
  features: featuresSchema.default(FEATURES),
  // .default(undefined) is required for validation to actually work
  jira: jiraSchema.optional().default(undefined),
  descriptionTemplate: string().optional(),
  fileBlacklist: string().optional().default(FILE_BLACKLIST),
});

export type InstanceConfig = InferType<typeof instanceConfigSchema>;
export type Features = InferType<typeof featuresSchema>;
export type Settings = InferType<typeof settingsSchema>;
export type SettingName = DeepKeysOf<Settings>;

export const DEFAULT_INSTANCE: Partial<InstanceConfig> = {
  repo: "*",
  ghBaseUrl: "https://api.github.com",
};

export const INITIAL_VALUES: Settings = {
  features: FEATURES,
  fileBlacklist: FILE_BLACKLIST,
};

type Params = {
  onSuccess: (settings: Settings) => void | Promise<void>;
  onError?: (e?: unknown) => void;
};

const defaultOnError = (e?: unknown) => {
  console.error(e);
  alert("Couldn't load or validate your Settings from chrome storage.");
};

// Gracefully cast settings
function castSettings(data: unknown) {
  return settingsSchema.cast(data, {
    // remove unspecified keys from objects
    stripUnknown: true,
    // do not throw TypeError if casting doesn't produce a valid type
    // will likely fallback to null if casting fails
    assert: false,
  });
}

export function getSettings({ onSuccess, onError = defaultOnError }: Params) {
  // First try to get from local storage to check if persistToUserProfile is enabled
  chrome.storage.local
    .get(Object.keys(settingsSchema.fields))
    .then((localEntries) => {
      if (Object.keys(localEntries).length === 0) {
        // settings sync can't be activated if no no local entries are present
        void onSuccess(INITIAL_VALUES);
      } else {
        const localSettings = castSettings(localEntries);

        // If persistToUserProfile is enabled, use sync storage
        if (localSettings?.features.persistToUserProfile) {
          void chrome.storage.sync
            .get(Object.keys(settingsSchema.fields))
            .then((syncEntries) => {
              if (Object.keys(syncEntries).length === 0) {
                // No sync data, use local settings
                void onSuccess(localSettings);
              } else {
                const syncSettings = castSettings(syncEntries);

                void onSuccess(syncSettings);
              }
            })
            .catch((e) => {
              console.warn(
                "Sync storage access failed, using local. Error:",
                e,
              );
              // Fallback to local if sync fails
              void onSuccess(localSettings);
            });
        } else {
          void onSuccess(localSettings);
        }
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
