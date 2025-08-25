import { Box, Text } from "@primer/react";
import { Form, Formik, FormikHelpers } from "formik";
import React, { useEffect, useState } from "react";
import { TabNavigation, Tab } from "../components";
import { Features } from "../services/getSettings";
import {
  INITIAL_VALUES,
  Settings,
  getSettings,
  persistSettings,
  settingsSchema,
} from "../services";
import { SubmitButton } from "../popup/Button";
import { GhInstancesTab, JiraTab } from "../popup/Tabs";
import { AutoFilterTab } from "../popup/Tabs/AutoFilterTab";
import styles from "./Options.module.scss";

const tabs: Array<Tab> = ["GH Instances", "Auto filter", "Jira"];

type Props = {
  features: Features;
  onError: (message?: string) => void;
  onSuccess: (message: string) => void;
  onReset: () => void;
};

export const SettingsTab: React.FC<Props> = ({
  features,
  onError,
  onSuccess,
  onReset: _,
}) => {
  const [activeTab, setActiveTab] = useState<Tab>("GH Instances");
  const [result, resultSet] = useState("");
  const [initialValues, initialValuesSet] = useState<Settings>(INITIAL_VALUES);

  useEffect(() => {
    getSettings({
      onSuccess: initialValuesSet,
      onError: () => onError("Couldn't load from chrome storage"),
    });
  }, [onError]);

  const handleSubmit = (
    values: Settings,
    { setSubmitting, resetForm }: FormikHelpers<Settings>,
  ) =>
    persistSettings({
      values,
      onSuccess: () => {
        resetForm({ values });
        resultSet("Saved successfully");
        onSuccess("Settings saved successfully");
      },
      onError: () => {
        resultSet("Couldn't save");
        onError("Couldn't save settings");
      },
      onSettled: () => setSubmitting(false),
    });

  const mapTabToComponent = (tab: Tab, values: Settings, isValid: boolean) => {
    switch (tab) {
      case "Auto filter":
        return <AutoFilterTab disabled={!features.autoFilter} />;
      case "GH Instances":
        return <GhInstancesTab values={values} isValid={isValid} />;
      case "Jira":
        return <JiraTab disabled={!features.jira} />;
    }
  };

  return (
    <Box>
      <Text as="h2" className={styles.sectionTitle}>
        Settings
      </Text>

      <Text as="p" className={styles.subtitle}>
        Configure GitHub instances, auto-filtering, and Jira integration.
      </Text>

      <Box sx={{ marginTop: 4 }}>
        <TabNavigation
          tabs={tabs}
          activeTab={activeTab}
          onTabClick={setActiveTab}
        />

        <Box sx={{ marginTop: 3 }}>
          <Formik
            enableReinitialize
            validateOnMount
            initialValues={initialValues}
            onSubmit={handleSubmit}
            validationSchema={settingsSchema}
          >
            {({ isValid, dirty, isSubmitting, values }) => {
              return (
                <Form>
                  {mapTabToComponent(activeTab, values, isValid)}
                  <Box sx={{ marginTop: 4 }}>
                    <SubmitButton
                      isValid={isValid}
                      dirty={dirty}
                      isSubmitting={isSubmitting}
                      result={result}
                    />
                  </Box>
                </Form>
              );
            }}
          </Formik>
        </Box>
      </Box>
    </Box>
  );
};
