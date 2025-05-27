const webpack = require('webpack');
const { merge } = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin');
const common = require('./webpack.config.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'cheap-module-source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
      'process.env.MOCKED_API': JSON.stringify('false'),
      'process.env.API_BACKEND': JSON.stringify('http://localhost:5055'),
      'process.env.EXTENSION_ID': JSON.stringify('inmniboeooddjgipkkodoageimggnbka')
    }),
  ],
});
