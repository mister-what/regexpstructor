module.exports = {
  extends: "eslint:recommended",
  parser: "@babel/eslint-parser",
  // parserOptions: {
  //   ecmaVersion: 2021,
  //   sourceType: "module",
  // },
  plugins: ["import"],
  env: {
    es2021: true,
    node: true,
    jest: true,
  },
  rules: {
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
