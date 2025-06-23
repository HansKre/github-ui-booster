import { Pagehead, Text } from "@primer/react";
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

export const GhInstancesTab = ({ values, isValid }: Props) => {
  return (
    <FieldArray name="instances">
      {/* eslint-disable-next-line @typescript-eslint/unbound-method */}
      {({ push, remove }) => (
        <>
          {isNonEmptyArray(values.instances) &&
            values.instances.map((_, index) => (
              <React.Fragment key={index}>
                <Pagehead className={styles.container}>
                  <Text as="h2" className={styles.heading}>
                    {`GH Instance ${index + 1}`}
                  </Text>
                  <RemoveButton
                    disabled={values.instances.length === 1}
                    onClick={() => remove(index)}
                  />
                </Pagehead>
                <FormField
                  label="Personal Access Token"
                  description="For the public GitHub-instance, go to https://github.com/settings/tokens to create a new token and check the checkbox for repo-permissions."
                  name={`instances[${index}].pat`}
                />
                <FormField
                  label="Username or Organization"
                  description="Your GitHub username or organization (only GitHub Enterprise). You can input multiple values. Use commas to separate them (e.g. value1,value2,value3)."
                  name={`instances[${index}].org`}
                />
                <FormField
                  label="Repository"
                  description="You can input multiple values. Use commas to separate them (e.g. value1,value2,value3)."
                  name={`instances[${index}].repo`}
                />
                <FormField
                  label="GitHub API Base URL"
                  description="Use https://api.github.com for the public GitHub-instance, or ask your IT if running your own GitHub Enterprise Server."
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
