import { Field } from "formik";
import React from "react";
import styles from "./FormField.module.scss";
import { SettingName } from "../../services";

type Props = {
  label: string;
  name: SettingName;
  error?: string;
  disabled?: boolean;
};

export const FormField: React.FC<Props> = ({
  label,
  name,
  error,
  disabled,
}) => {
  return (
    <div className={styles.fieldWrapper}>
      <label className={styles.label} htmlFor={name}>
        {label}
      </label>
      <Field
        className={styles.field}
        id={name}
        name={name}
        type="text"
        disabled={disabled}
      />
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};
