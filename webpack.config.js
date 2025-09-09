const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const outputPath = path.resolve(__dirname, 'dist/expanded');

module.exports = {
  mode:
    process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'production'
      ? process.env.NODE_ENV
      : process.env.NODE_ENV === 'test'
        ? 'none'
        : 'development',

  entry: {
    process_list: './src/js/entries/process_list',
    process_content: './src/js/entries/process_content',
    common: './src/js/common.js',
    service_worker: './src/js/service_worker.js',
    options: './src/js/options.js',
  },

  output: {
    path: outputPath,
    filename: ({ chunk }) => (['options'].includes(chunk.name) ? 'html/[name].js' : 'js/[name].js'),
  },

  resolve: {
    alias: {
      model: path.resolve(__dirname, 'src/js/model'),
      view: path.resolve(__dirname, 'src/js/view'),
      controller: path.resolve(__dirname, 'src/js/controller'),
      api: path.resolve(__dirname, 'src/js/api'),
      actions: path.resolve(__dirname, 'src/js/actions'),
      utils: path.resolve(__dirname, 'src/js/utils'),
      tests: path.resolve(__dirname, 'src/__tests__'),
      css: path.resolve(__dirname, 'src/css'),
    },
  },

  module: {
    rules: [
      // SCSS
      {
        test: /\.scss$/,
        oneOf: [
          // 1 SCSS raw para Shadow DOM
          {
            resourceQuery: /raw/,
            use: ['raw-loader', 'sass-loader']
          },

          // 2️ CSS global
          {
            include: [path.resolve(__dirname, 'src/css')],
            use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader', 'sass-loader']
          },

          // 3 CSS Modules para componentes
          {
            include: [path.resolve(__dirname, 'src/js')],
            use: [
              'style-loader',
              {
                loader: 'css-loader',
                options: {
                  modules: true,
                  importLoaders: 1
                }
              },
              'postcss-loader',
              'sass-loader'
            ]
          }
        ]
      },

      // CSS puro de node_modules
      {
        test: /\.css$/,
        include: /node_modules/,
        use: ['style-loader', 'css-loader']
      },

      // JS
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      },

      // Imagens
      {
        test: /\.(png|jpg|gif|svg)$/,
        type: 'asset',
        parser: { dataUrlCondition: { maxSize: 8192 } }
      }
    ]
  },

  devtool: 'cheap-module-source-map',

  plugins: [
    new MiniCssExtractPlugin({
      filename: ({ chunk }) => (['options'].includes(chunk.name) ? 'html/[name].css' : 'css/[name].css'),
    }),
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/manifest.json', to: outputPath + '/' },
        { from: 'src/icons', to: outputPath + '/icons' },
        { from: 'src/html', to: outputPath + '/html' },
      ],
    })
  ],
};
