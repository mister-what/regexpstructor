module.exports = (api) => {
  return {
    ignore: api.env("test") ? [] : ["./*.bs.js", "./**/*.bs.js"],
    presets: api.env("test")
      ? [
          "@babel/preset-typescript",
          [
            "@babel/preset-env",
            {
              targets: api.env("test")
                ? {
                    node: "current",
                  }
                : { browsers: ">1%, not IE < 11" },
              useBuiltIns: "usage",
              corejs: "3.29",
              shippedProposals: true,
            },
          ],
        ]
      : ["@babel/preset-typescript"],
    plugins: ["@babel/plugin-proposal-class-properties"],
  };
};
