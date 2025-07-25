import { Link } from "@primer/react";
import { Form, Formik, FormikHelpers } from "formik";
import React, { useEffect, useState } from "react";
import { Tab, TabNavigation } from "../components";
import {
  INITIAL_VALUES,
  Settings,
  getSettings,
  persistSettings,
  settingsSchema,
} from "../services";
import { SubmitButton } from "./Button";
import styles from "./Content.module.scss";
import { GhInstancesTab, JiraTab } from "./Tabs";
import { AutoFilterTab } from "./Tabs/AutoFilterTab";
import { Paragraph } from "./Typography";

const tabs: Array<Tab> = ["GH Instances", "Auto filter", "Jira"];

export const Content = () => {
  const [activeTab, setActiveTab] = useState<Tab>("GH Instances");
  const [result, resultSet] = useState("");
  const [initialValues, initialValuesSet] = useState<Settings>(INITIAL_VALUES);

  useEffect(() => {
    getSettings({
      onSuccess: initialValuesSet,
      onError: () => resultSet("Couldn't load from chrome storage"),
    });
    // eslint-disable-next-line react-hooks-addons/no-unused-deps
  }, [initialValues]);

  const handleSubmit = (
    values: Settings,
    { setSubmitting, resetForm }: FormikHelpers<Settings>,
  ) =>
    persistSettings({
      values,
      onSuccess: () => {
        // reset form-state, e.g. isDirty
        resetForm({ values });
        resultSet("Saved successfully");
      },
      onError: () => resultSet("Couldn't save"),
      onSettled: () => setSubmitting(false),
    });

  const mapTabToComponent = (tab: Tab, values: Settings, isValid: boolean) => {
    switch (tab) {
      case "Auto filter":
        return <AutoFilterTab disabled={!values.features.autoFilter} />;
      case "GH Instances":
        return <GhInstancesTab values={values} isValid={isValid} />;
      case "Jira":
        return <JiraTab disabled={!values.features.jira} />;
    }
  };

  return (
    <section className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.headingContainer}>
          <h1 className={styles.heading}>GitHub UI Booster - Settings</h1>
          <Paragraph sx={{ paddingLeft: "1rem" }}>
            Enable/disable features in the{" "}
            <Link href={chrome.runtime.getURL("options.html")} target="_blank">
              options page
            </Link>
          </Paragraph>
        </div>
        <div className={styles.divider} />
        <TabNavigation
          tabs={tabs}
          activeTab={activeTab}
          onTabClick={setActiveTab}
        />
        <Formik
          enableReinitialize
          validateOnMount
          initialValues={initialValues}
          onSubmit={handleSubmit}
          validationSchema={settingsSchema}
        >
          {({ isValid, dirty, isSubmitting, values }) => {
            return (
              <Form className={styles.form}>
                {mapTabToComponent(activeTab, values, isValid)}
                <SubmitButton
                  isValid={isValid}
                  dirty={dirty}
                  isSubmitting={isSubmitting}
                  result={result}
                />
              </Form>
            );
          }}
        </Formik>
      </div>
    </section>
  );
};
