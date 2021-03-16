const esbuild = require("esbuild");
const babel = import("esbuild-plugin-babel").then(
  ({ default: babel }) => babel
);

const build = ({ format, extension, env = { NODE_ENV: "development" } }) =>
  babel.then((babel) =>
    esbuild.build({
      format,
      bundle: true,
      entryPoints: ["src/index.js"],
      outExtension: { ".js": `.${extension}` },
      outdir: "dist",
      target: ["node6"],
      plugins: [
        babel({
          config: {
            babelrc: false,
            configFile: false,
            presets: [],
            plugins: [
              require.resolve("@babel/plugin-proposal-class-properties"),
              require.resolve("@babel/plugin-proposal-private-methods"),
              require.resolve("babel-plugin-macros"),
            ],
          },
        }),
      ],
      define: Object.fromEntries(
        Object.entries(env).map(([envVar, value]) => [
          `process.env.${envVar}`,
          JSON.stringify(value),
        ])
      ),
      // minify: true,
    })
  );
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
