const path = require('path');

module.exports = {
    mode: 'production',
    entry: './resources/js/writr-bundle.js',
    output: {
        filename: 'writr-bundle.js',
        path: path.resolve(__dirname, 'public/js'),
        library: {
            name: 'Writr',
            type: 'umd',
            export: 'default'
        },
        globalObject: 'this'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    },
    externals: {
        // We'll bundle everything, no externals
    },
    resolve: {
        extensions: ['.js'],
        modules: ['node_modules']
    }
};
