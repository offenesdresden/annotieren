var webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
var path = require('path');
var buildPath = path.resolve(__dirname, 'public');
var TransferWebpackPlugin = require('transfer-webpack-plugin');

const nodeModulesPath = path.resolve(__dirname, 'node_modules');
const reactmdPath = nodeModulesPath + '/react-md'

var config = {
  entry: [path.join(__dirname, '/src/app.js')],
  resolve: {
    //When require, do not have to add these extensions to file's name
    extensions: ["", ".js", ".jsx", ".scss"],
    //node_modules: ["web_modules", "node_modules"]  (Default Settings),
  },
  //Render source-map file for final build
  devtool: 'source-map',
  //output config
  output: {
    path: buildPath,    //Path of output file
    filename: 'bundle.js'  //Name of output file
  },
  plugins: [
    new webpack.ProvidePlugin({
      fetch: 'imports?this=>global!exports?global.fetch!whatwg-fetch'
    }),
    //Minify the bundle
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        //supresses warnings, usually from module minification
        warnings: false
      }
    }),
    //Allows error warnings but does not stop compiling. Will remove when eslint is added
    new webpack.NoErrorsPlugin(),
    //Transfer Files
    new TransferWebpackPlugin([
      {from: 'html'}
    ], path.resolve(__dirname,"src")),

    new ExtractTextPlugin("styles.css")
  ],
  module: {
    preLoaders: [
      {
        test: /\.(js|jsx)$/,
        loader: 'eslint-loader',
        include: [path.resolve(__dirname, "src/")],
        exclude: [nodeModulesPath]
      },
    ],
    loaders: [
      {
        test: /\.(js|jsx)$/, //All .js and .jsx files
        loader: 'babel', //react-hot is like browser sync and babel loads jsx and es6-7
        exclude: [nodeModulesPath],
        query: {
          presets: ['react', 'es2015']
        }
      },
      {
        test: /\.scss$/,
        //exclude: [nodeModulesPath],
        loader: ExtractTextPlugin.extract('style', 'css!postcss!sass?outputStyle=compressed'),
      }
    ]
  },
  //Eslint config
  eslint: {
    configFile: '.eslintrc' //Rules for eslint
  },
};

module.exports = config;
