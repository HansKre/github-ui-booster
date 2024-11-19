import { Form, Formik, FormikHelpers } from "formik";
import React, { useEffect, useState } from "react";
import { Tab, TabNavigation } from "../components";
import {
  INITIAL_VALUES,
  Settings,
  getSettings,
  settingsSchema,
} from "../services";
import { AddButton, SubmitButton } from "./Button";
import styles from "./Content.module.scss";
import { SettingsTab } from "./Tabs";
import { AutoFilterTab } from "./Tabs/AutoFilterTab";

const tabs: Array<Tab> = ["Settings", "Auto filter"];
type FormValues = Settings;

export const Content = () => {
  const [activeTab, setActiveTab] = useState<Tab>("Settings");
  const [result, resultSet] = useState("");
  const [initialValues, initialValuesSet] =
    useState<FormValues>(INITIAL_VALUES);

  useEffect(() => {
    getSettings({
      onSuccess: initialValuesSet,
      onError: () => resultSet("Couldn't load from chrome storage"),
    });
  }, [initialValues]);

  const handleSubmit = (
    values: FormValues,
    { setSubmitting, resetForm }: FormikHelpers<FormValues>
  ) => {
    const promises = Object.entries(values).map(([key, value]) => {
      return chrome.storage.local.set({
        [key]: value,
      });
    });
    Promise.all(promises)
      .then(() => {
        // reset form-state, e.g. isDirty
        resetForm({ values });
        resultSet("Saved successfully");
      })
      .catch(() => resultSet("Couldn't save"))
      .finally(() => setSubmitting(false));
  };

  const mapTabToComponent = (tab: Tab, values: Settings) => {
    switch (tab) {
      case "Auto filter":
        return <AutoFilterTab disabled={!initialValues.autoFilter.active} />;
      case "Settings":
        return <SettingsTab values={values} />;
    }
  };

  return (
    <section className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.headingContainer}>
          <h1 className={styles.heading}>GitHub UI Booster - Settings</h1>
        </div>
        <div className={styles.divider} />
        <TabNavigation
          tabs={tabs}
          activeTab={activeTab}
          onTabClick={setActiveTab}
        />
        <Formik
          enableReinitialize
          initialValues={initialValues}
          onSubmit={handleSubmit}
          validationSchema={settingsSchema}>
          {({ isValid, dirty, isSubmitting, values }) => {
            return (
              <Form className={styles.form}>
                {mapTabToComponent(activeTab, values)}
                <AddButton disabled={false} />
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
