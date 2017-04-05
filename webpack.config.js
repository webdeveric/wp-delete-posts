const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const isDev = process.env.NODE_ENV === "development";

const extractSass = new ExtractTextPlugin({
  filename: '[name].css',
  disable: isDev,
});

const plugins = [
  new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  }),
  extractSass,
];

if ( ! isDev ) {
  plugins.push( new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false,
      drop_console: false,
    }
  }) );
}

module.exports = {
  entry: "./js/main.jsx",

  output: {
    path: path.resolve(__dirname, "dist"),
    filename: '[name].js',
    chunkFilename: '[id].js'
  },

  module: {
    rules: [
      {
        enforce: "pre",
        test: /\.jsx$/,
        exclude: /node_modules/,
        loader: "eslint-loader",
      },
      {
        test: /\.jsx?$/,
        include: [
          path.resolve(__dirname, "js")
        ],
        exclude: [
        ],
        loader: "babel-loader",
      },
      {
        test: /\.scss$/,
        use: extractSass.extract({
          use: [
            {
              loader: "css-loader"
            },
            {
              loader: "postcss-loader",
              options: {
                plugins: () => [
                  require('autoprefixer')
                ],
              }
            },
            {
              loader: "sass-loader"
            }
          ],
          fallback: "style-loader"
        }),
      },
    ],
  },

  resolve: {
    modules: [
      "node_modules",
      path.resolve(__dirname, "js")
    ],
    extensions: [".js", ".jsx"],
  },

  devtool: "source-map",

  context: __dirname,

  target: "web",

  plugins,
};
