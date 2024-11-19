import { Text } from "@primer/react";
import { FieldArray } from "formik";
import React from "react";
import { isNonEmptyArray } from "ts-type-safe";
import { Settings } from "../../../services";
import { FormField } from "../../FormField";
import styles from "./SettingsTab.module.scss";

type Props = {
  values: Settings;
};

export const SettingsTab = ({ values }: Props) => {
  return (
    <FieldArray name="instances">
      {({ insert, remove, push }) => (
        <>
          {isNonEmptyArray(values.instances) &&
            values.instances.map((_, index) => (
              <React.Fragment key={index}>
                <Text as="h2" className={styles.heading}>
                  {`GH Instance ${index + 1}`}
                </Text>
                <FormField
                  label="Personal Access Token"
                  name={`instances[${index}].pat`}
                />
                <FormField
                  label="Organization"
                  name={`instances[${index}].org`}
                />
                <FormField
                  label="Repository"
                  name={`instances[${index}].repo`}
                />
                <FormField
                  label="GitHub API Base URL"
                  name={`instances[${index}].ghBaseUrl`}
                />
              </React.Fragment>
            ))}
        </>
      )}
    </FieldArray>
  );
};
