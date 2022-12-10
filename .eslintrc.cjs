/* eslint-disable sort-keys-fix/sort-keys-fix */
module.exports = {
  ignorePatterns: ["serviceWorker.ts", "*/_generated", "*.html"],
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    "airbnb",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "prettier",
  ],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: "module",
  },
  plugins: [
    "react",
    "@typescript-eslint",
    "typescript-sort-keys",
    "react-hooks",
    "sort-keys-fix",
    "import",
  ],
  rules: {
    // Disable some AirBnB rules.
    // Allow any linebreak type.
    "linebreak-style": "off",

    // Disable rules that will be enabled by typescript-eslint
    quotes: "off",
    camelcase: "off",

    // API might not have camelcase
    "@typescript-eslint/camelcase": ["off"],

    // JSX can be in either jsx or tsx files
    "react/jsx-filename-extension": [1, { extensions: [".tsx", ".jsx"] }],

    // Turn off rules related to Prettier. These are auto fixed.
    "max-len": "off",
    "@typescript-eslint/quotes": "off",
    "arrow-parens": "off",
    "@typescript-eslint/semi": "off",
    "react/jsx-closing-bracket-location": "off",
    "@typescript-eslint/indent": "off", // Conflicts with Prettier settings
    // Make comma-dangle error bc it needs to be in version control
    // or else it is confusing. See: https://eslint.org/docs/rules/comma-dangle
    "comma-dangle": ["error", "always-multiline"],

    // Don't prefer default exports
    "import/no-default-export": "error",
    "import/prefer-default-export": "off",

    // Don't require extensions for the follow files
    "import/extensions": [
      "error",
      "ignorePackages",
      {
        js: "never",
        jsx: "never",
        ts: "never",
        tsx: "never",
      },
    ],
    "import/no-unresolved": "off",

    // Rules related to function definitions
    "func-style": ["error", "expression"],
    "implicit-arrow-linebreak": "off",

    // Alphabetize
    "sort-vars": "error",
    "typescript-sort-keys/interface": "error",
    "typescript-sort-keys/string-enum": "error",
    "react/jsx-sort-props": "error",
    "sort-keys-fix/sort-keys-fix": "error",

    // More typescript specific rules
    "@typescript-eslint/array-type": "error",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/type-annotation-spacing": "error",

    "@typescript-eslint/naming-convention": [
      "error",
      {
        selector: "interface",
        format: ["PascalCase"],
      },
    ],

    // React Hooks
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",

    // React
    "react/jsx-props-no-spreading": "off",

    // Make debugger a warning instead of an error
    "no-debugger": "warn",
    "no-console": ["warn", { allow: ["warn", "error"] }],

    // Don't require radix parameter
    radix: "off",

    // Allow nested ternary (often it's cleaner)
    "no-nested-ternary": "off",

    "no-param-reassign": ["error", { props: false }],

    "no-unused-expressions": [
      "error",
      { allowShortCircuit: true, allowTernary: true },
    ],

    // Enforce the same syntax for all arrow functions
    "arrow-body-style": ["error", "always"],

    // https://stackoverflow.com/questions/63818415/react-was-used-before-it-was-defined
    "no-use-before-define": "off",
    "@typescript-eslint/no-use-before-define": ["error"],

    // https://stackoverflow.com/questions/63961803/eslint-says-all-enums-in-typescript-app-are-already-declared-in-the-upper-scope
    "no-shadow": "off",
    "@typescript-eslint/no-shadow": ["error"],
    "react/function-component-definition": [
      2,
      {
        namedComponents: "arrow-function",
        unnamedComponents: "arrow-function",
      },
    ],
    "react/jsx-no-useless-fragment": "off",
    "react/prop-types": "off",
  },
  settings: {
    // Imports with these extensions can be resolved with relative path
    "import/resolver": {
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
      },
    },
  },
  overrides: [
    {
      files: ["**/*.test.tsx"],
      env: {
        jest: true,
      },
    },
  ],
};
