const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");


module.exports = (env, argv) => {
    // Receives env.ghp, which tells webpack whether or not the build is intended for GitHub Pages
    env.ghp = env.ghp ?? false;

    /*const filesToPrecache = [];
    const fontContext = ('src/assets/fonts/transandina/', true, /\.WOFF$/);
    fontContext.keys().forEach(key => filesToPrecache.push(key));*/

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
                { from: env.ghp ? "public/manifest-ghp.json" : "public/manifest-local.json", to: "manifest.json" },
                { from: "public/favicon.ico", to: "favicon.ico" },
                { from: "src/assets/images/pwa-icons", to: "pwa-icons" },
            ],
        })
    ];
    if (argv.mode !== 'development') plugins.push(
        new WorkboxPlugin.GenerateSW({
            clientsClaim: true,
            skipWaiting: true,
            maximumFileSizeToCacheInBytes: 8000000,
            swDest: env.ghp ? "FortyEight/service-worker.js" : "service-worker.js",
            runtimeCaching: [
                {
                    urlPattern: env.ghp ? new RegExp('^/FortyEight/assets/') : new RegExp('^/assets/'),
                    handler: 'CacheFirst',
                    options: {
                        cacheName: 'custom-images-fonts-cache',
                        expiration: {
                            maxEntries: 100,
                            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
                        },
                    },
                },
            ],
            //include: (env.ghp ? ['/FortyEight/assets/*.WOFF', '/FortyEight/assets/*.png'] : ['/assets/*.WOFF', '/assets/*.png'])
            include: ['src/assets/images/*.png', /^src\/assets\/fonts\/(?:[^/]+\/)*[^/]+\.WOFF$/, 'src/assets/fonts/**/*.css']
            //include: filesToPrecache
        })
    );

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