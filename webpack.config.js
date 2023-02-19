const path = require('path');
const WorkboxPlugin = require('workbox-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');

const dest = path.resolve(__dirname, 'dist');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: dest,
  },
  plugins: [
    new WorkboxPlugin.GenerateSW(),
    new ESLintPlugin({
      fix: true,
      emitWarning: true,
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: ['@babel/plugin-proposal-object-rest-spread'],
          },
        },
      },
      {
        test: /\.(scss)$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
          },
          {
            loader: 'postcss-loader',
          },
          {
            loader: 'sass-loader',
          },
        ],
      },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      {
        test: /\.png$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              mimetype: 'image/png',
            },
          },
        ],
      },
    ],
  },
  devServer: {
    https: true,
    port: 3000,
    static: {
      directory: dest,
    },
  },
};
