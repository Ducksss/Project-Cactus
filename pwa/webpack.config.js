const path = require('path');

module.exports = {
    mode: 'production',
    stats: 'errors-only',
    entry: {
        index: './src/index.js',
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    devServer: {
        static: './dist',
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
}