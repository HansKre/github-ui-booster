import React from "react";
import { Button } from "./Button";

export type Props = {
  isValid: boolean;
  dirty: boolean;
  isSubmitting: boolean;
  result: string | undefined;
};

export const SubmitButton: React.FC<Props> = ({
  isValid,
  dirty,
  isSubmitting,
  result,
}) => {
  return (
    <Button
      type="submit"
      disabled={!isValid || !dirty || isSubmitting}
      result={isSubmitting ? undefined : result}>
      {isSubmitting ? "Submitting..." : "💽 Save"}
    </Button>
  );
};
