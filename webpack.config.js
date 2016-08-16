var path = require('path');
var webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');

const isProd = (process.env.NODE_ENV === 'production');

var plugins = [
  new webpack.optimize.OccurenceOrderPlugin(),
  new webpack.optimize.DedupePlugin(),
  new webpack.ProvidePlugin({
    'fetch': 'imports?this=>global!exports?global.fetch!whatwg-fetch'
  }),
  new webpack.optimize.CommonsChunkPlugin(
    {
      children: true,
      async: true
      // name: "common",
      // filename: "common.js",
  }),
  new HtmlWebpackPlugin({
    title: 'My Log',
    filename: 'index.html',
    template: 'index.html'
  }),
  new webpack.DefinePlugin({
    "process.env": {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV)
    }
  }),
  new CopyWebpackPlugin([
    { from:'vendor/css', to: 'css'},
    { from:'css', to: 'css'},
    { from: 'img', to: 'img'}
  ])
];

if (isProd) {
  plugins.push(new webpack.optimize.UglifyJsPlugin({ // Optimize the JavaScript...
      compress: {
        warnings: false // ...but do not show warnings in the console (there is a lot of them)
      },
      minimize: true
  }))
}
module.exports = {
  devServer: {
    // This is required for webpack-dev-server if using a version <3.0.0.
    // The path should be an absolute path to your build destination.
    outputPath: path.join(__dirname, 'dist')
  },
  entry: ["webpack-dev-server/client?http://localhost:2345","./index.js"],
  output: { path:path.join(__dirname, 'dist') , filename: 'bundle.js' },
  module: {
    loaders: [
      {
        test: /.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015', 'react']
        }
      }
    ]
  },
  plugins: plugins
};
