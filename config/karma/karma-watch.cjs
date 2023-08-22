const extendConfiguration = require('./karma-extend.cjs');

module.exports = function (config) {
  'use strict';
  config.set(extendConfiguration({
    browsers: ['ChromeHeadlessNoSandbox'],
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox']
      }
    }
  }));
};
