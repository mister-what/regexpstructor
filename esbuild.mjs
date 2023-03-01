import Module from "module";

import esbuild from "esbuild";
import babel from "esbuild-plugin-babel";

const require = Module.createRequire(import.meta.url);

const build = ({ format, extension, env = { NODE_ENV: "development" } }) =>
  esbuild.build({
    format,
    bundle: true,
    entryPoints: [`src/index.${extension}`],
    outdir: `dist/${format}`,
    target: ["node12"],
    plugins: [],
    define: Object.fromEntries(
      [
        Object.entries(env).map(([envVar, value]) => [
          `process.env.${envVar}`,
          JSON.stringify(value),
        ]),
        [["__DEV__", JSON.stringify(env.NODE_ENV !== "production")]],
      ].flat()
    ),
    // minify: true,
  });

Promise.resolve()
  .then(() => {
    console.log("Starting build...");
  })
  .then(() =>
    Promise.all([
      build({
        format: "esm",
        extension: "mjs",
        env: { NODE_ENV: "production" },
      }),
      build({
        format: "cjs",
        extension: "cjs",
        env: { NODE_ENV: "production" },
      }),
    ])
  )
  .then(() => {
    console.log("Done");
  })
  .catch((error) => {
    console.error("Build failed.");
    console.error(error);
  });
