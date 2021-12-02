module.exports = {
  extends: "eslint:recommended",
  parser: "@typescript-eslint/parser",
  // parserOptions: {
  //   ecmaVersion: 2021,
  //   sourceType: "module",
  // },
  plugins: ["@typescript-eslint", "import"],
  env: {
    es2021: true,
    node: true,
    jest: true,
  },
  rules: {
    "no-unused-vars": 0,
    "import/order": [
      "warn",
      {
        groups: ["builtin", "external", "parent", "sibling", "index"],
        "newlines-between": "always",
        alphabetize: {
          order: "asc",
          caseInsensitive: true,
        },
      },
    ],
  },
};
