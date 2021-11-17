#!/usr/bin/env node

const webpack = require("webpack");
const config = require("../webpack.config");

const main = async () => {
  const createCompiler = (options, callback) => {
    let compiler;
    const webpackConfig = {
      mode: "production",
      ...config,
    };

    try {
      compiler = webpack(webpackConfig, callback);
    } catch (error) {
      console.error(error);

      process.exit(2);
    }

    return compiler;
  };

  const env = {
    WEBPACK_BUNDLE: true,
    WEBPACK_BUILD: true,
  };

  const options = { env };

  return new Promise((resolve) => {
    const callback = (error, stats) => {
      if (error) {
        console.error(error);
        process.exit(2);
      }

      if (stats.hasErrors()) {
        process.exitCode = 1;
      }

      const printedStats = stats.toString();

      // Avoid extra empty line when `stats: 'none'`
      if (printedStats) {
        console.log(printedStats);
      }
      resolve();
    };
    createCompiler(options, callback);

    resolve();
  });
};

(async () => {
  await main();
})();
