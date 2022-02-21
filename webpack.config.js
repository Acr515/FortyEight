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
        test: /\.(css|sass|scss)$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
      },
      {
        test: /\.(eot|ttf|svg|jpg|png)$/,
        type: 'asset/resource',
        parser: {
          dataUrlCondition: {
            maxSize: 4 * 1024
          }
        },
      },
      {
        test: /\.(woff|woff2)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/[hash][ext][query]'
        }
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
    assetModuleFilename: 'assets/[hash][ext][query]'
  },
  devServer: {
    static: path.resolve(__dirname, './public'),
  },
};