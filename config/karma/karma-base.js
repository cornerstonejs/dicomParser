const webpackConfig = require("./webpack.karma");

/* eslint no-process-env:0 */
process.env.CHROME_BIN = require("puppeteer").executablePath();

module.exports = {
  basePath: "../../",
  frameworks: ["mocha"],
  reporters: ["progress", "coverage"],
  files: ["test/**/*_test.ts"],

  plugins: [
    "karma-webpack",
    "karma-mocha",
    "karma-chrome-launcher",
    "karma-firefox-launcher",
    "karma-coverage",
  ],

  preprocessors: {
    "src/**/*.ts": ["webpack"],
    "test/**/*_test.ts": ["webpack"],
  },

  webpack: webpackConfig,

  webpackMiddleware: {
    noInfo: false,
    stats: {
      chunks: false,
      timings: false,
      errorDetails: true,
    },
  },

  coverageReporter: {
    dir: "./coverage",
    reporters: [
      { type: "html", subdir: "html" },
      { type: "lcov", subdir: "." },
      { type: "text", subdir: ".", file: "text.txt" },
      { type: "text-summary", subdir: ".", file: "text-summary.txt" },
    ],
  },
};
