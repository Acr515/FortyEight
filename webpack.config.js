const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: path.resolve(__dirname, './src/index.js'),
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      },
      {
        test: /\.(css)$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      },
      {
        test: /\.(woff|woff2|eot|ttf|svg|jpg|png)$/,
        use: {
          loader: 'url-loader',
        },
      }
    ]
  },
  resolve: {
    extensions: ['*', '.js', '.jsx']
  },
  plugins: [
      new MiniCssExtractPlugin(),
      new HtmlWebpackPlugin({
        template: 'src/index.html'
      })
  ],
  output: {
    path: path.resolve(__dirname, './build'),
    filename: 'bundle.js',
  },
  devServer: {
    static: path.resolve(__dirname, './public'),
  },
};