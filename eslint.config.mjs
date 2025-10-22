// @ts-check
import eslintJs from "@eslint/js";
import globals from "globals";
import tsEslintPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import reactHooksAddons from "eslint-plugin-react-hooks-addons";

export default [
  {
    files: ["**/*.ts", "**/*.tsx", "**/*d.ts"],
    ignores: ["**/__tests__/**"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        chrome: "readonly", // Declare chrome as a global variable
        NodeJS: "readonly", // Add NodeJS explicitly
      },
      ecmaVersion: "latest",
      sourceType: "module",
      parser: tsParser,
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
    plugins: {
      "@typescript-eslint": tsEslintPlugin,
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      "react-hooks-addons": reactHooksAddons,
    },
    rules: {
      ...eslintJs.configs.recommended.rules, // Include recommended JavaScript rules
      ...tsEslintPlugin.configs.recommended.rules, // Include recommended TypeScript rules
      ...tsEslintPlugin.configs["recommended-type-checked"].rules, // Include type-checked rules
      ...reactPlugin.configs.recommended.rules, // Include React recommended rules
      ...reactPlugin.configs["jsx-runtime"].rules, // Include React JSX runtime rules
      ...reactHooksPlugin.configs.recommended.rules, // Include React Hooks rules
      "react-hooks/exhaustive-deps": "error",
      "react-hooks-addons/no-unused-deps": "warn", // check unused and potentially unnecessary dependencies in useEffect
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^[_]*$",
        },
      ],
      "react/prop-types": "off",
    },
  },
  {
    files: ["**/__tests__/**/*.ts", "**/__tests__/**/*.tsx"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
        chrome: "readonly",
        NodeJS: "readonly",
      },
      ecmaVersion: "latest",
      sourceType: "module",
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        project: "**/tsconfig.test.json",
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    plugins: {
      "@typescript-eslint": tsEslintPlugin,
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      "react-hooks-addons": reactHooksAddons,
    },
    rules: {
      ...eslintJs.configs.recommended.rules,
      ...tsEslintPlugin.configs.recommended.rules,
      ...tsEslintPlugin.configs["recommended-type-checked"].rules,
      ...reactPlugin.configs.recommended.rules,
      ...reactPlugin.configs["jsx-runtime"].rules,
      ...reactHooksPlugin.configs.recommended.rules,
      "react-hooks/exhaustive-deps": "error",
      "react-hooks-addons/no-unused-deps": "warn",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^[_]*$",
        },
      ],
      "react/prop-types": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/unbound-method": "off",
    },
  },
  {
    ignores: [
      "**/node_modules/**",
      "**/build/**",
      "**/dist/**",
      "**/coverage/**",
    ],
  },
];
