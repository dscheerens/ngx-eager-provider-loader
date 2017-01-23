module.exports = (config) => {
    config.set({
        basePath: './',

        frameworks: [ 'jasmine' ],

        files: [

            // zone.js
            'node_modules/zone.js/dist/zone.js',
            'node_modules/zone.js/dist/long-stack-trace-zone.js',
            'node_modules/zone.js/dist/proxy.js',
            'node_modules/zone.js/dist/sync-test.js',
            'node_modules/zone.js/dist/jasmine-patch.js',
            'node_modules/zone.js/dist/async-test.js',
            'node_modules/zone.js/dist/fake-async-test.js',

            // RxJs
            'node_modules/rxjs/bundles/Rx.js',

            // Angular
            ...getAngularFiles(['core']),

            // Application
            'tmp/test/test-root.umd.js'
        ],

        reporters: [ 'mocha', 'coverage' ],

        coverageReporter: {
            type: 'text-summary'
        },

        preprocessors: {
            'tmp/test/test-root.umd.js': ['coverage']
        },

        colors: true,

        logLevel: config.LOG_INFO,

        browsers: [ 'Chrome' ],

        autoWatch: false,

        singleRun: true,

    });
};

// Copied from AngularFire2: https://github.com/angular/angularfire2/blob/2.0.0-beta.7/karma.conf.js#L42
function getAngularFiles(packages) {
    return packages.reduce((files, pkg) => {
        files.push(`node_modules/@angular/${pkg}/bundles/${pkg}.umd.js`);
        files.push(`node_modules/@angular/${pkg}/bundles/${pkg}-testing.umd.js`);
        return files;
    }, []);
}
