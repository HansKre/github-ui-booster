import { Text } from "@primer/react";
import { FormikErrors } from "formik";
import React from "react";
import { Settings } from "../../../services";
import { FormField } from "../../FormField";
import styles from "./SettingsTab.module.scss";

type Props = {
  errors: FormikErrors<Settings>;
};

export const SettingsTab = ({ errors }: Props) => {
  return (
    <>
      <Text as="h2" className={styles.heading}>
        GH Instance 1
      </Text>
      <FormField label="Personal Access Token" name="pat" error={errors.pat} />
      <FormField label="Organization" name="org" error={errors.org} />
      <FormField label="Repository" name="repo" error={errors.repo} />
      <FormField
        label="GitHub API Base URL"
        name="ghBaseUrl"
        error={errors.ghBaseUrl}
      />
    </>
  );
};
