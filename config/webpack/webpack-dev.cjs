const webpack = require('webpack');
const merge = require('./merge.cjs');
const baseConfig = require('./webpack-base.cjs');

const devConfig = {
  devServer: {
    hot: true,
    static: {
      publicPath: '/dist/'
    }
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin({})
  ]
};

module.exports = merge(baseConfig, devConfig);
