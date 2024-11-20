import { ToggleSwitch } from "@primer/react";
import { Field, FieldProps } from "formik";
import React from "react";
import { SettingName } from "../../services";
import formFieldStyles from "../FormField/FormField.module.scss";
import { Paragraph } from "../Typography";
import styles from "./ToggleField.module.scss";

type Props = {
  label: string;
  name: SettingName;
  description?: string;
};

export const ToggleField: React.FC<Props> = ({ label, name, description }) => {
  return (
    <div className={styles.container}>
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
                size="small"
              />
            );
          }}
        </Field>
      </div>
      {description && (
        <Paragraph sx={{ maxWidth: "75%" }}>{description}</Paragraph>
      )}
    </div>
  );
};
