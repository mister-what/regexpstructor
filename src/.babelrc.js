module.exports = (api) => {
  return {
    ignore: api.env("test") ? [] : ["./*.bs.js", "./**/*.bs.js"],
    presets: api.env("test")
      ? [
          [
            "@babel/preset-env",
            {
              targets: api.env("test")
                ? {
                    node: "current",
                  }
                : { browsers: ">1%, not IE < 11" },
              useBuiltIns: "usage",
              corejs: "3.9",
              shippedProposals: true,
            },
          ],
        ]
      : [],
    plugins: [
      //["babel-plugin-polyfill-corejs3", { method: "usage-pure" }],
      "babel-plugin-macros",
    ],
  };
};
