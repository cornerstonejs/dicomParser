const path = require("path");
module.exports = {
  mode: "development",

  entry: {
    dicomParser: "./src/index.ts",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    libraryTarget: "umd",
    library: "dicomParser",
    umdNamedDefine: true,
  },
  node: {
    fs: "empty",
  },
  resolve: {
    extensions: [".ts", ".js", ".tsx"],
  },
  devtool: "source-map",

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true,
            },
          },
        ],
      },
      {
        enforce: "pre",
        test: /\.tsx$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "tslint-loader",
            options: {
              // /* Loader options go here */
              // // tslint errors are displayed by default as warnings
              // // set emitErrors to true to display them as errors
              // emitErrors: false,
              // // tslint does not interrupt the compilation by default
              // // if you want any file with tslint errors to fail
              // // set failOnHint to true
              // failOnHint: false,
            },
          },
        ],
      },
    ],
  },
};
