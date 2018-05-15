const path = require('path');
const rootPath = process.cwd();
const context = path.join(rootPath, "src");
const outputPath = path.join(rootPath, 'dist');
const bannerPlugin = require(path.join(__dirname, 'plugins', 'banner.js'));

module.exports = {
  mode: 'development',
  context: context,
  entry: {
    dicomParser: './index.js'
  },
  target: 'web',
  output: {
    filename: '[name].js',
    library: {
      commonjs: "dicom-parser",
      amd: "dicom-parser",
      root: 'dicomParser'
    },
    libraryTarget: 'umd',
    globalObject: 'this',
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
