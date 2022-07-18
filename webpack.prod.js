const path = require('path');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const TerserWPPlugin = require('terser-webpack-plugin');
const CSSMinimizerWPPlugin = require('css-minimizer-webpack-plugin');

module.exports = merge(common, {
    mode: 'production',

    optimization: {
        minimize: true,
        minimizer: [
            new CSSMinimizerWPPlugin(),
            new TerserWPPlugin()
        ]
    }
})