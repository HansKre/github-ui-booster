import { InferType, object, string } from "yup";

const autoFilterSchema = object({
  filter: string().optional(),
  repo: string().optional(),
});

export type AutoFilter = InferType<typeof autoFilterSchema>;

export const settingsSchema = object({
  pat: string().required().matches(/^ghp_/, "Should start with ghp_").min(30),
  org: string().required(),
  repo: string().required(),
  ghBaseUrl: string().required().url(),
  autoFilter: autoFilterSchema,
});

type NestedKeys<T, Prefix extends string = ""> = {
  [K in keyof T]: T[K] extends object
    ?
        | `${Prefix}${K & string}`
        | `${Prefix}${K & string}.${NestedKeys<T[K], "">}`
    : `${Prefix}${K & string}`;
}[keyof T];

export type SettingName = NestedKeys<Settings>;

export type Settings = InferType<typeof settingsSchema>;

export const INITIAL_VALUES = {
  pat: "",
  org: "",
  repo: "",
  ghBaseUrl: "https://api.github.com",
  autoFilter: { filter: "", repo: "" },
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
