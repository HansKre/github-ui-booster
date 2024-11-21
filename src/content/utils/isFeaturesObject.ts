import { hasOwnProperty } from "ts-type-safe";
import { Features } from "../../services";

export const isFeaturesObject = (features: unknown): features is Features => {
  return (
    typeof features === "object" &&
    features !== null &&
    hasOwnProperty(features, "baseBranchLabels") &&
    hasOwnProperty(features, "changedFiles") &&
    hasOwnProperty(features, "totalLines") &&
    hasOwnProperty(features, "autoFilter")
  );
};
