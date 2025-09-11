const webpack = require('webpack');
const ZipPlugin = require('zip-webpack-plugin');
const { merge } = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin');

// Set NODE_ENV before requiring the common config
process.env.NODE_ENV = 'production';

const common = require('./webpack.config.js');

module.exports = merge(common, {
  mode: 'production',
  devtool: false,
  performance: {
    hints: false,
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
      'process.env.MOCKED_API': JSON.stringify('false'),
      'process.env.API_BACKEND': JSON.stringify('https://servicos.dnit.gov.br/sima-back'),
      'process.env.EXTENSION_ID': JSON.stringify('idgpfcigpineakeljpkhfbeilhagjgfa')
    }),
    new ZipPlugin({
      path: '../', // Output zip in the project root
      filename: 'sei-plugin-dist.zip'
    }),
  ],
});