import React, { useState } from "react";
import styles from "./SearchInput.module.scss";

type Props = {
  label: string;
  name: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  onFocus?: (value: string) => void;
  onBlur?: () => void;
};

export const SearchInput: React.FC<Props> = ({
  label,
  name,
  onChange,
  disabled,
  onFocus,
  onBlur,
}) => {
  const [value, valueSet] = useState("");
  return (
    <input
      placeholder={label}
      className={styles.input}
      id={name}
      type="text"
      disabled={disabled}
      value={value}
      onChange={(e) => {
        const newValue = e.target.value;
        valueSet(newValue);
        debounce((newValue) => onChange(newValue), 200);
        onChange(newValue);
      }}
      onFocus={() => onFocus?.(value)}
      onBlur={onBlur}
    />
  );
};

function debounce<T extends (...args: string[]) => void>(
  callback: T,
  delay: number,
) {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      callback(...args);
    }, delay);
  };
}
