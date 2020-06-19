// Karma configuration
// Generated on Thu Jun 18 2020 08:31:24 GMT+0200 (GMT+02:00)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine', 'fixture', 'karma-typescript'],
    karmaTypescriptConfig: require('./tsconfig.node-module.json'),

    plugins: config.plugins.concat(
      'karma-fixture',
      'karma-typescript',
      // require('karma-jasmine'),
      // require('karma-typescript'),
      // require('karma-chrome-launcher'),
      // require('karma-firefox-launcher'),
      // require('karma-jasmine-html-reporter'),
      // require('karma-mocha-reporter'),
      // require('karma-coverage-istanbul-reporter'),
      // require('karma-html2js-preprocessor'),
    ),

    // list of files / patterns to load in the browser
    files: [
      { pattern: 'node_modules/requirejs/require.js', included: false, watched: false },
      { pattern: '../../dist/**/*.js', included: false },
      { pattern: '../../src/**/*.ts', included: false },
      { pattern: 'src/**/*.css', included: false },
      'src/**/*.html',
      'src/**/*.@(spec|model).@(ts|js)',
    ],

    proxies: {
      '/scripts/require.js': '/base/node_modules/requirejs/require.js',
      '/scripts/': '/base/src/',
      '/styles/': '/base/src/',
      '/app/': 'http://localhost:4300/',
    },

    // list of files / patterns to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      ...config.preprocessors,
      '**/*.html': ['html2js'],
      "**/*.ts": "karma-typescript" // *.tsx for React Jsx
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['kjhtml', 'mocha', 'karma-typescript'],
    jasmineHtmlReporter: {
      suppressAll: true, // Suppress all messages (overrides other suppress settings)
      suppressFailed: true // Suppress failed messages
    },

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,

    client: {
      clearContext: false,
    },
  })
}
