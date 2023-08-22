const path = require('path');
const webpackConfig = require('../webpack/index.cjs');

/* eslint no-process-env:0 */
process.env.CHROME_BIN = require('puppeteer').executablePath();

// Deleting output.library to avoid "Uncaught SyntaxError: Unexpected token /" error
// when running testes (var test/foo_test.js = ...)
delete webpackConfig.output.library;

// Code coverage
webpackConfig.module.rules.push({
  test: /\.js$/,
  include: path.resolve('./src/'),
  loader: 'babel-loader'
});

module.exports = {
  basePath: '../../',
  frameworks: ['mocha'],
  reporters: ['progress'],
  files: [
    'test/**/*_test.js'
  ],

  plugins: [
    'karma-webpack',
    'karma-mocha',
    'karma-chrome-launcher',
    'karma-firefox-launcher'
  ],

  preprocessors: {
    'src/**/*.js': ['webpack'],
    'test/**/*_test.js': ['webpack']
  },

  webpack: webpackConfig,

  webpackMiddleware: {
    noInfo: false,
    stats: {
      chunks: false,
      timings: false,
      errorDetails: true
    }
  }
};