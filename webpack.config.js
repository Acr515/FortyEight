const webpack = require('webpack');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');


module.exports = env => ({
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
                use: [
                    'style-loader', 'css-loader', 'sass-loader'
                ]
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
        new HtmlWebpackPlugin({
            template: 'src/index.html'
        }),
        new webpack.NormalModuleReplacementPlugin(
            /(.*)GAME_YEAR(\.*)/,
            function (resource) {
                resource.request = resource.request.replace(
                    /GAME_YEAR/, env.game_year
                );
            }
        ),
    ],
    output: {
        path: path.resolve(__dirname, './build'),
        filename: 'bundle.js',
        assetModuleFilename: 'assets/[hash][ext][query]'
    },
    devServer: {
        static: path.resolve(__dirname, './public'),
    },
    resolve: {
        extensions: ["*", ".js", ".jsx"],
        alias: {
            assets: path.resolve(__dirname, "src", "assets"),
            components: path.resolve(__dirname, "src", "components"),
            context: path.resolve(__dirname, "src", "context"),
            data: path.resolve(__dirname, "src", "data"),
            screens: path.resolve(__dirname, "src", "screens"),
            util: path.resolve(__dirname, "src", "util"),
        }
    }
});