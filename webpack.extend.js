const path = require('path');
const webpack = require('webpack');

module.exports = {
    module: {
        rules: [
            // Your loader configurations here
            // {
            //     test: /\.scss$/,
            //     use: [
            //         'style-loader',
            //         'css-loader',
            //         'sass-loader',
            //     ],
            // },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]',
                    outputPath: 'src/assets/fonts',
                }
            },
            {
                test: /\.(png|jpe?g|gif)$/i,
                loader: "file-loader",
                options: {
                    limit: 10000,
                    name: "[name].[ext]",
                    outputPath: "src/assets/images/pictures",
                }

            },
            {
                test: /\.svg$/,
                loader: "svg-url-loader",
            },
        ]
    },
    output: {
        // Ensure Webpack output is to 'dist' directory
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/dist/'
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery'
        }),
    ],
};
