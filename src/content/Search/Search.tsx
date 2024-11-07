import React, { useState } from "react";
import styles from "./Search.module.scss";

type Props = {
  label: string;
  name: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export const Search: React.FC<Props> = ({
  label,
  name,
  onChange,
  disabled,
}) => {
  const [value, valueSet] = useState("");

  return (
    <div className={styles.fieldWrapper}>
      <input
        placeholder={label}
        className={styles.field}
        id={name}
        type="text"
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};
