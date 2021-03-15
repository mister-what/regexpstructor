import path from "path";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";
import pkg from "./package.json";

export default [
  {
    plugins: [
      resolve({
        rootDir: path.resolve(__dirname, "..", ".."),
      }),
      commonjs(),
      babel({ babelHelpers: "bundled" }),
    ],
    input: { index: "src/index.js" },
    output: [
      {
        dir: path.dirname(pkg.main),
        format: "cjs",
        exports: "default",
        entryFileNames: "[name].js",
      },
      {
        dir: path.dirname(pkg.module),
        format: "es",
        entryFileNames: "[name].mjs",
      },
    ],
  },
];
