export default {
    entry: './index.js',
    dest: './bundles/index.js',
    format: 'umd',
    moduleName: 'ng.eagerProviderLoader',
    globals: {
        '@angular/core': 'ng.core'
    },
    external: [ '@angular/core' ]
};
