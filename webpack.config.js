var path = require('path');
var webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');


const isProd = (process.env.NODE_ENV === 'production');

var plugins = [
  new webpack.ProvidePlugin({
    'fetch': 'imports?this=>global!exports?global.fetch!whatwg-fetch'
  }),
  new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: Infinity,
      filename: 'vendor.bundle.js?[hash]'
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
    { from: 'img', to: 'img'},
    { from: 'favicon.ico'}
  ]),
  new CleanWebpackPlugin(['dist']),
  new ExtractTextPlugin('style.css', { allChunks: true })

];

if (isProd) {

  plugins.push(new webpack.optimize.DedupePlugin())

  plugins.push(new webpack.optimize.OccurenceOrderPlugin())

  plugins.push(new webpack.optimize.UglifyJsPlugin({ // Optimize the JavaScript...
    compress: {
      warnings: false
    },
    output: {
      comments: false
    },
    sourceMap: false,
    minimize: true
  }))
}
module.exports = {
  devServer: {
    // This is required for webpack-dev-server if using a version <3.0.0.
    // The path should be an absolute path to your build destination.
    outputPath: path.join(__dirname, 'dist'),
  },
  devtool:  isProd ? 'hidden-source-map' : 'cheap-eval-source-map',
  entry: {
    // bundle: ["webpack-dev-server/client?http://localhost:2345","./index.js"],
    bundle: ["./index.js"],
    vendor: ['react', 'react-dom','redux', 'react-redux','react-router']
  },
  output: {
     path:path.join(__dirname, 'dist') ,
     filename: '[name].js?[hash]',
     publicPath: "/"
   },
  module: {
    loaders: [
      {
        test: /.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015', 'react'],
          cacheDirectory: true
        }
      },
      {
        test: /\.(gif|png|jpg|jpeg\ttf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
        loader: 'file'
      },
      { test: /\.css$/,
        loader: ExtractTextPlugin.extract('style-loader', 'css-loader?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!postcss-loader')
      },

    ]
  },

  postcss: [
   require('autoprefixer'),
  ],

  resolve: {
     modulesDirectories: ['node_modules', 'components']
  },
  plugins: plugins
};
