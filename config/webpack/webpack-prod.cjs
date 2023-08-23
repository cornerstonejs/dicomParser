const merge = require('./merge.cjs');
const baseConfig = require('./webpack-base.cjs');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const devConfig = {
  output: {
    filename: '[name].min.js'
  },
  mode: "production",
  optimization: {
    minimizer: [
      new UglifyJSPlugin({
        sourceMap: true
      })
    ]
  },
};

module.exports = merge(baseConfig, devConfig);