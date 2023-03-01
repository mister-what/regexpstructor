import dts from "rollup-plugin-dts";

const config = [
  {
    input: "./typings/index.d.ts",
    output: [{ file: "./dist/esm/index.d.ts", format: "es" }],
    plugins: [dts()],
  },
  {
    input: "./typings/index.d.ts",
    output: [{ file: "./dist/cjs/index.d.ts", format: "es" }],
    plugins: [dts()],
  },
];

export default config;
