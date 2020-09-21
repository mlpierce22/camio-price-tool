module.exports = {
  transpileDependencies: ["vuetify"],

  configureWebpack: {
    devtool: "source-map"
  },

  publicPath: "/camio-price-tool/", // required if we want to use github
  outputDir: "docs" // doc will allow it to be served by github
};
