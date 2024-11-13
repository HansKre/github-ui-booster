const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");

module.exports = merge(common, {
  devtool: "inline-source-map",
  /**
   * mode: 'development' seems to cause following issue:
   *
   * vendor.js:60277 Uncaught TypeError: Cannot read properties of null (reading 'get')
   * at ./node_modules/@primer/live-region-element/dist/esm/index.js (vendor.js:60277:21)
   * at __webpack_require__ (content_prs_page.js:1141:42)
   */
  mode: "production",
});
