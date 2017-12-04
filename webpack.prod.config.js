let path =      require("path"),
webpack =   require("webpack");


module.exports = {
  cache: true,
  devtool: "source-map",
  context: path.join(__dirname, "/src/client"),
  entry: {
    main: "./main",
    vendor: [
      "lodash",
      "axios",
      "react",
      "react-dom",
      "react-router",
      "react-bootstrap"
    ]
  },
  output: {
    path: path.join(__dirname, "/public/js/"),
    filename: "[name].js",
    chunkFilename: "[id].js",
    sourceMapFilename: "[name].map",
    publicPath: "./js/"
  },
  module: {
    rules: [
      // required for babel to kick in
      { test: /\.js$/, exclude: /node_modules/, use: [
        { loader: "babel-loader" }
      ]},
      
      // required to write "require('./style.scss')"
      { test: /\.css$/,  use: [
        { loader: "style-loader" },
        { loader: "css-loader" }
      ]},
      { test: /\.png$/,  use: [
        { loader: "url-loader?limit=100000" }
      ]},
      { test: /\.svg$/,           use: [
        { loader: "file-loader?prefix=font/" }
      ]}
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      "_":        "lodash",
      "axios":    "axios",
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: "vendor",
      filename: "vendor.js"
    })
  ]
};
