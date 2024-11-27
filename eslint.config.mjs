// @ts-check
import { fixupConfigRules } from "@eslint/compat";
import { FlatCompat } from "@eslint/eslintrc";
import eslintJs from "@eslint/js";
import globals from "globals";
import tsEslint from "typescript-eslint";

const compat = new FlatCompat();

const languageOptions = {
  globals: {
    ...globals.browser,
    ...globals.node,
  },
  ecmaVersion: "latest",
  sourceType: "module",
};

const typescriptConfig = {
  languageOptions: {
    ...languageOptions,
    parser: tsEslint.parser,
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
      project: "**/tsconfig.json",
    },
  },

  settings: {
    react: {
      version: "detect",
    },
  },

  rules: {
    "react/prop-types": [
      "off",
      {
        ignore: ["children"],
      },
    ],
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        args: "all",
        argsIgnorePattern: "^[_]*$",
      },
    ],
  },
};

export default tsEslint.config(
  eslintJs.configs.recommended,
  ...tsEslint.configs.recommendedTypeChecked,
  ...fixupConfigRules(
    compat.extends(
      "plugin:react/recommended",
      "plugin:react/jsx-runtime",
      "plugin:react-hooks/recommended"
    )
  ),
  {
    plugins: {
      "@typescript-eslint": tsEslint.plugin,
    },
    ...typescriptConfig,
  },
  {
    ignores: ["**/node_modules/**", "**/build/**"],
  }
);
