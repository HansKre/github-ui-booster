import { Pagehead } from "@primer/react";
import { FieldArray } from "formik";
import React from "react";
import { isNonEmptyArray } from "ts-type-safe";
import { SectionTitle, Subtitle } from "../../../components";
import { Settings } from "../../../services";
import { AddButton, RemoveButton } from "../../Button";
import { FormField } from "../../FormField";
import styles from "./GhInstancesTab.module.scss";

type Props = {
  values: Settings;
  isValid: boolean;
};

export const GhInstancesTab = ({ values, isValid }: Props) => {
  return (
    <>
      <Subtitle>
        Configure GitHub instances with API tokens and repository access.
      </Subtitle>
      <FieldArray name="instances">
        {(arrayHelpers) => (
          <>
            {isNonEmptyArray(values.instances) &&
              values.instances.map((_, index) => (
                <React.Fragment key={index}>
                  <Pagehead className={styles.container}>
                    <SectionTitle>{`GH Instance ${index + 1}`}</SectionTitle>
                    <RemoveButton
                      disabled={values.instances.length === 1}
                      onClick={() => arrayHelpers.remove(index)}
                    />
                  </Pagehead>
                  <FormField
                    label="Personal Access Token"
                    description="For the public GitHub-instance, go to https://github.com/settings/tokens to create a new token and check the checkbox for repo-permissions."
                    name={`instances[${index}].pat`}
                  />
                  <FormField
                    label="Username or Organization"
                    description="Your GitHub username or organization (only GitHub Enterprise). You can input multiple values using commas (e.g. value1,value2,value3) or use '*' as a wildcard to match any organization."
                    name={`instances[${index}].org`}
                  />
                  <FormField
                    label="Repository"
                    description="Repository name(s). You can input multiple values using commas (e.g. value1,value2,value3) or use '*' as a wildcard to match any repository."
                    name={`instances[${index}].repo`}
                  />
                  <FormField
                    label="GitHub API Base URL"
                    description="Use https://api.github.com for the public GitHub-instance, or ask your IT if running your own GitHub Enterprise Server."
                    name={`instances[${index}].ghBaseUrl`}
                  />
                  <FormField
                    label="Random Reviewers"
                    description="You can input multiple values. Use commas to separate them (e.g. user1,user2,user3)."
                    name={`instances[${index}].randomReviewers`}
                  />
                </React.Fragment>
              ))}
            <AddButton
              disabled={!isValid}
              push={(obj) => arrayHelpers.push(obj)}
            />
          </>
        )}
      </FieldArray>
    </>
  );
};
