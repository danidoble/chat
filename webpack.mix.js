const mix = require('laravel-mix');

mix.setPublicPath('public');
mix.setResourceRoot('../../public/');

mix.js('resources/js/app.js', 'js')
    .scripts([
        "resources/js/components.js",
    ], "public/js/components.js")
    .scripts([
        "resources/js/custom.js",
    ], "public/js/custom.js")
    .postCss('resources/css/app.css', 'css', [
        require('postcss-import'),
        require('tailwindcss'),
        require('autoprefixer'),
    ]);

if (mix.inProduction()) {
    mix.version();
    mix.sourceMaps();
}
