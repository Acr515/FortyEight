const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");


module.exports = (env, argv) => {

    const plugins = [
        new HtmlWebpackPlugin({
            template: 'src/index.html',
            title: 'FortyEight',
        }),
        new webpack.NormalModuleReplacementPlugin(
            /(.*)GAME_YEAR(\.*)/,
            function (resource) {
                resource.request = resource.request.replace(
                    /GAME_YEAR/, env.game_year
                );
            }
        ),
        new CopyPlugin({
            patterns: [
                { from: "public/manifest.json", to: "manifest.json" },
                { from: "src/assets/images/pwa-icons", to: "pwa-icons" },
            ],
        })
    ];
    if (argv.mode !== 'development') plugins.push(
        new WorkboxPlugin.GenerateSW({
            clientsClaim: true,
            skipWaiting: true,
            maximumFileSizeToCacheInBytes: 8000000,
        })
    )

    return {
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
        plugins,
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
    }
};