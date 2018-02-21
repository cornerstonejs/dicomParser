const path = require('path');
const webpack = require('webpack');
const rootPath = process.cwd();
const context = path.resolve(rootPath, "src");
const outputPath = path.resolve(rootPath, 'dist');
const bannerPlugin = require('./plugins/banner');

module.exports = {
  context: context,
  entry: {
    dicomParser: './index.js'
  },
  target: 'web',
  output: {
    filename: '[name].js',
    library: '[name]',
    libraryTarget: 'umd',
    path: outputPath,
    umdNamedDefine: true
  },
  devtool: 'source-map',
  module: {
    rules: [{
      enforce: 'pre',
      test: /\.js$/,
      exclude: /(node_modules|test)/,
      loader: 'eslint-loader',
      options: {
        failOnError: false
      }
    }, {
      test: /\.js$/,
      exclude: /(node_modules)/,
      use: [{
        loader: 'babel-loader'
      }]
    }]
  },
  plugins: [
    bannerPlugin()
  ]
};
