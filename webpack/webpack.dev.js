const { merge } = require("webpack-merge");
const common = require("./webpack.common");

module.exports = merge(common, {
  mode: "development",
  devServer: {
    historyApiFallback: true,
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:3003",
      },
    },
  },
});
