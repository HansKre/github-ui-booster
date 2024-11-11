import React from "react";
import styles from "./SearchInput.module.scss";

type Props = {
  label: string;
  name: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export const SearchInput: React.FC<Props> = ({
  label,
  name,
  onChange,
  disabled,
}) => {
  return (
    <input
      placeholder={label}
      className={styles.input}
      id={name}
      type="text"
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};
