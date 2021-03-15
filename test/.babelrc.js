module.exports = (api) => {
  return {
    presets: [
      [
        "@babel/preset-env",
        {
          targets: {
            node: api.env("test") ? "current" : "6",
          },
          useBuiltIns: "usage",
          corejs: 3,
          shippedProposals: true,
        },
      ],
    ],
    plugins: [
      //["babel-plugin-polyfill-corejs3", { method: "usage-pure" }],
      "babel-plugin-macros",
    ],
  };
};
