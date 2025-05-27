const webpack = require('webpack');
const { merge } = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin');
const common = require('./webpack.config.js');

process.env.NODE_ENV = 'production';

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
  ],
});
