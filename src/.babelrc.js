module.exports = (api) => {
  return {
    ignore: api.env("test") ? [] : ["./*.bs.js", "./**/*.bs.js"],
    presets: api.env("test")
      ? [
          [
            "@babel/preset-env",
            {
              targets: {
                node: "current",
              },
              useBuiltIns: "usage",
              corejs: 3,
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
