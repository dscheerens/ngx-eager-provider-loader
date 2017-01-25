export default {
    entry: './tmp/test/test-root.js',
    dest: './tmp/test/test-root.umd.js',
    format: 'umd',
    moduleName: 'ng.eagerProviderLoader',
    globals: {
        '@angular/core': 'ng.core',
        '@angular/core/testing': 'ng.core.testing',
        '@angular/platform-browser-dynamic/testing': 'ng.platformBrowserDynamic.testing'
    },
    external: [ '@angular/core', '@angular/core/testing', '@angular/platform-browser-dynamic/testing' ]
};
