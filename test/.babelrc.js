module.exports = (api) => {
  return {
    presets: [
      "@babel/preset-typescript",
      [
        "@babel/preset-env",
        {
          targets: {
            node: api.env("test") ? "current" : "6",
          },
          useBuiltIns: "usage",
          corejs: "3.29",
          shippedProposals: true,
        },
      ],
    ],
    plugins: [],
  };
};
