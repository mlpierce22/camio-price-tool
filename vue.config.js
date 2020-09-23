module.exports = {
  transpileDependencies: ["vuetify"],

  configureWebpack: {
    devtool: "source-map"
  },
  filenameHashing: false,
  css: {
    extract: false
  },
  // publicPath: "/camio-price-tool/", // required if we want to use github
  // outputDir: "dist" // doc will allow it to be served by github

  publicPath: "/includes/camio-price-tool/dist", // required if we want to deploy on camio
  outputDir: "dist" // dist will allow it to be served by github
};
