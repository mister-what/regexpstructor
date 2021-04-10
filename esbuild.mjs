import esbuild from "esbuild";
import babel from "esbuild-plugin-babel";
import Module from "module";

const require = Module.createRequire(import.meta.url);

const build = ({ format, extension, env = { NODE_ENV: "development" } }) =>
  esbuild.build({
    format,
    bundle: true,
    entryPoints: [`src/index.${extension}`],
    outExtension: { ".js": `.${extension}` },
    outdir: "dist",
    target: ["node6"],
    plugins: [
      babel({
        config: {
          babelrc: false,
          configFile: false,
          presets: [
            [
              require.resolve("@babel/preset-typescript"),
              {
                allowNamespaces: true,
                allowDeclareFields: true,
                onlyRemoveTypeImports: true,
              },
            ],
          ],
          plugins: [
            require.resolve("@babel/plugin-proposal-class-properties"),
            require.resolve("@babel/plugin-transform-destructuring"),
            require.resolve("@babel/plugin-proposal-private-methods"),
            require.resolve("babel-plugin-macros"),
          ],
        },
      }),
    ],
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
