const webpack = require('webpack');
const { merge } = require('webpack-merge');

// Set NODE_ENV before requiring the common config
process.env.NODE_ENV = 'test';

const common = require('./webpack.config.js');

module.exports = merge(common, {
  // Add mock entry to existing entries instead of replacing them
  entry: {
    ...common.entry,
    /* test mocks */
    mock: './src/__tests__/e2e/html/mock.js',
  },  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('test'),
      'process.env.MOCKED_API': JSON.stringify('true'),
      'process.env.API_BACKEND': JSON.stringify('http://localhost:5055'),
      'process.env.EXTENSION_ID': JSON.stringify('inmniboeooddjgipkkodoageimggnbka')
    }),
  ],
});
