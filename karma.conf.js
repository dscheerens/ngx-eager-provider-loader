module.exports = (config) => {
    config.set({
        basePath: './',

        frameworks: [ 'jasmine' ],

        files: [
            'test-tmp/example.spec.js',
            'test-tmp/eager-provider-functions.spec.js'
        ],

        reporters: [ 'mocha' ],

        colors: true,

        logLevel: config.LOG_INFO,

        browsers: [ 'Chrome' ],

        autoWatch: false,

        singleRun: true,

    });
};
