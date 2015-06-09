  'use strict';

  var gulp = require('gulp'),
    taskListing = require('gulp-task-listing'),
// linting
    jshint = require('gulp-jshint'),
// Test Unit
    exec = require('child_process').exec;

  var jsLintFiles = [
    // config
    'gulpfile.js',
    'config/**/*.js',
    // node
    'app/**/*.js'
  ];

  gulp.task('default', taskListing);
  gulp.task('help', taskListing);

  gulp.task('init', function () {
    gulp.src('./config/env/example/*')
      .pipe(gulp.dest('./config/env'));
  });

  gulp.task('watch-lint', function () {
    gulp.watch(jsLintFiles, ['lint']);
  });

  gulp.task('watch-test', function () {
    gulp.watch([
      'app/**/*.js',
      'app/lib/schemas/*.json',
      'config/**/*.js'
    ], ['test']);
  });

  gulp.task('lint', function () {
    gulp.src(jsLintFiles)
      .pipe(jshint('.jshintrc', {fail: true}))
      .pipe(jshint.reporter()); // Console output
  });

  gulp.task('test', function (cb) {

    var tests = '\'app/**/*spec.js\'';

    // TODO: use command line options library here.
    if (process.argv[3] === '--suite' && process.argv[4]) {
      tests = process.argv[4];
    }

    exec('NODE_ENV=test ./node_modules/istanbul/lib/cli.js cover node_modules/mocha/bin/_mocha ' +
    '-x \'*spec.js\' --root app/ --dir test/coverage  -- ' + tests, function (err, stdout, stderr) {
      console.log(stdout);
      console.log(stderr);
      cb(err);
    });
  });
