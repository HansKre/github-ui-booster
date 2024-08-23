import { Field, FieldProps } from "formik";
import React from "react";
import styles from "./ToggleField.module.scss";
import { SettingName } from "../../services";
import { ToggleSwitch } from "@primer/react";
import formFieldStyles from "../FormField/FormField.module.scss";

type Props = {
  label: string;
  name: SettingName;
};

export const ToggleField: React.FC<Props> = ({ label, name }) => {
  return (
    <div className={styles.toggleWrapper}>
      <label className={formFieldStyles.label} htmlFor={name}>
        {label}
      </label>
      <Field className={styles.field} id={name} name={name} type="button">
        {({ field, form }: FieldProps<boolean>) => {
          return (
            <ToggleSwitch
              onClick={(e) => {
                e.preventDefault();
                form.setFieldValue(field.name, !field.value);
                form.submitForm();
              }}
              checked={field.value}
            />
          );
        }}
      </Field>
    </div>
  );
};
