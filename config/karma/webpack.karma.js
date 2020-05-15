const common = require("../../webpack.common");
const merge = require("webpack-merge");

// Deleting output.library to avoid "Uncaught SyntaxError: Unexpected token /" error
// when running testes (var test/foo_test.js = ...)
delete common.output.library;
//delete common.module.rules;

module.exports = merge(common, {
  module: {
    rules: [
      {
        enforce: "post",
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "istanbul-instrumenter-loader",
            options: { esModules: true },
          },
        ],
      },
    ],
  },
});
