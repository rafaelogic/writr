const mix = require('laravel-mix');
const path = require('path');

/*
 |--------------------------------------------------------------------------
 | Writr Editor Build Configuration
 |--------------------------------------------------------------------------
 |
 | This file configures the build process for the Writr editor assets.
 | It creates both development and production builds with proper optimization.
 |
 */

// Set public path for assets
mix.setPublicPath('public');

// Main editor bundle - SINGLE SOURCE OF TRUTH (JS only)
mix.js('resources/js/writr.js', 'public/js/writr.js')
   .options({
       processCssUrls: false,
       hmrOptions: {
           host: 'localhost',
           port: 8080
       },
       terser: false, // Disable terser for all builds
   })
   .disableNotifications();

// Build CSS separately
mix.sass('resources/sass/writr.scss', 'public/css/writr.css')
   .options({
       processCssUrls: false,
       postCss: [
           require('tailwindcss'),
           require('autoprefixer'),
       ],
   });

// Development specific
if (!mix.inProduction()) {
    mix.sourceMaps();
    mix.webpackConfig({
        devtool: 'inline-source-map'
    });
}

// Production specific
if (mix.inProduction()) {
    mix.version(); // Cache busting
    
    // Disable terser to preserve our code
    mix.options({
        terser: false,
    });

    // Create minified versions
    mix.copy('public/js/writr.js', 'public/js/writr.min.js');
    mix.copy('public/css/writr.css', 'public/css/writr.min.css');
}

// Webpack configuration
mix.webpackConfig({
    resolve: {
        extensions: ['.js', '.jsx', '.json'],
        alias: {
            '@': path.resolve('resources/js'),
            '@sass': path.resolve('resources/sass'),
        },
    },
    optimization: {
        splitChunks: false,
        runtimeChunk: false,
        concatenateModules: false,
        minimize: false, // Disable minification
    },
    mode: mix.inProduction() ? 'production' : 'development',
    output: {
        libraryTarget: 'window',
    },
});

// Disable mix-manifest.json in dist
mix.options({
    manifest: false
});
