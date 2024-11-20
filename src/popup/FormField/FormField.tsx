import { ErrorMessage, Field } from "formik";
import React from "react";
import { SettingName } from "../../services";
import styles from "./FormField.module.scss";

type Props = {
  label: string;
  description?: string;
  name: SettingName;
  disabled?: boolean;
};

export const FormField: React.FC<Props> = ({
  label,
  description,
  name,
  disabled,
}) => {
  return (
    <div className={styles.fieldWrapper}>
      <label className={styles.label} htmlFor={name}>
        {label}
      </label>
      {description && <p className={styles.description}>{description}</p>}
      <Field
        className={styles.field}
        id={name}
        name={name}
        type="text"
        disabled={disabled}
      />
      <p className={styles.error}>
        <ErrorMessage name={name} />
      </p>
    </div>
  );
};
