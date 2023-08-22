const extendConfiguration = require('./karma-extend.cjs');

module.exports = function (config) {
  'use strict';
  config.set(extendConfiguration({
    singleRun: true,
    browsers: ['ChromeHeadlessNoSandbox'],
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox']
      }
    }
  }));
};
