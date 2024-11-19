import { Text } from "@primer/react";
import { FieldArray } from "formik";
import React from "react";
import { isNonEmptyArray } from "ts-type-safe";
import { Settings } from "../../../services";
import { AddButton, RemoveButton } from "../../Button";
import { FormField } from "../../FormField";
import styles from "./SettingsTab.module.scss";

type Props = {
  values: Settings;
  isValid: boolean;
};

export const SettingsTab = ({ values, isValid }: Props) => {
  return (
    <FieldArray name="instances">
      {({ push, remove }) => (
        <>
          {isNonEmptyArray(values.instances) &&
            values.instances.map((_, index) => (
              <React.Fragment key={index}>
                <div className={styles.container}>
                  <Text as="h2" className={styles.heading}>
                    {`GH Instance ${index + 1}`}
                  </Text>
                  <RemoveButton
                    disabled={values.instances.length === 1}
                    onClick={() => remove(index)}
                  />
                </div>
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
          <AddButton disabled={!isValid} push={push} />
        </>
      )}
    </FieldArray>
  );
};
