const path = require('path');

const dest = path.resolve(__dirname, 'dist');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'main.js',
        path: dest,
    },
    devServer: {
        https: true,
        port: 3000,
        contentBase: dest,
        inline: true,
    }
};