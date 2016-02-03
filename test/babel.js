'use strict';
var path = require('path');
var helpers = require('yeoman-generator').test;
var assert = require('yeoman-assert');

describe('Babel feature', function () {
  describe('on', function () {
    before(function (done) {
      helpers.run(path.join(__dirname, '../app'))
        .inDir(path.join(__dirname, 'temp'))
        .withOptions({'skip-install': true})
        .withPrompts({features: [], jsVariant: 'babel'})
        .on('end', done);
    });

    it('should add dependencies', function () {
      assert.fileContent('package.json', '"gulp-babel"');
      assert.fileContent('package.json', '"gulp-plumber"');
    });

    it('should use the ES6 ESLint environment', function () {
      assert.fileContent('eslint.json', '"es6": true');
    });

    it('should add the scripts task', function () {
      assert.fileContent('gulpfile.babel.js', "gulp.task('scripts'");
      assert.fileContent('gulpfile.babel.js', "['styles', 'fonts', 'scripts']");
      assert.fileContent('gulpfile.babel.js', "gulp.watch('app/scripts/**/*.js', ['scripts'])");
      assert.fileContent('gulpfile.babel.js', "'/scripts': '.tmp/scripts',");
    });

    it('should create a babel file', function () {
      assert.file('app/scripts/main.babel.js');
    });
  });

  describe('off', function () {
    before(function (done) {
      helpers.run(path.join(__dirname, '../app'))
        .inDir(path.join(__dirname, 'temp'))
        .withOptions({'skip-install': true})
        .withPrompts({features: [], jsVariant: 'vanilla'})
        .on('end', done);
    });

    it('shouldn\'t add dependencies', function () {
      assert.noFileContent('package.json', '"gulp-babel"');
    });

    it('shouldn\'t use the ES6 ESLint environment', function () {
      assert.noFileContent('eslint.json', '"es6": true');
    });

    it('shouldn\'t add the scripts task', function () {
      assert.noFileContent('gulpfile.babel.js', "gulp.task('scripts'");
      assert.fileContent('gulpfile.babel.js', "['styles']");
      assert.fileContent('gulpfile.babel.js', "['styles', 'fonts']");
      assert.fileContent('gulpfile.babel.js', "'app/scripts/**/*.js',");
      assert.noFileContent('gulpfile.babel.js', "gulp.watch('app/scripts/**/*.js', ['scripts'])");
      assert.fileContent('gulpfile.babel.js', "'/scripts': 'app/scripts',");
    });

    it('shouldn\'t create a babel file', function () {
      assert.noFile('app/scripts/main.babel.js');
    });
  });
});
