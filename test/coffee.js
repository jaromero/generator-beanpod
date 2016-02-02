'use strict';
var path = require('path');
var helpers = require('yeoman-generator').test;
var assert = require('yeoman-assert');

describe('CoffeeScript feature', function () {
  describe('on', function () {
    before(function (done) {
      helpers.run(path.join(__dirname, '../app'))
        .inDir(path.join(__dirname, 'temp'))
        .withOptions({'skip-install': true})
        .withPrompts({features: [], jsVariant: 'coffee'})
        .on('end', done);
    });

    it('should add dependencies', function () {
      assert.fileContent('package.json', '"gulp-coffee"');
      assert.fileContent('package.json', '"gulp-plumber"');
    });

    it('should add the scripts task', function () {
      assert.fileContent('gulpfile.babel.js', "gulp.task('scripts'");
      assert.fileContent('gulpfile.babel.js', "['styles', 'fonts', 'scripts']");
      assert.fileContent('gulpfile.babel.js', "'app/scripts/**/*.js',");
      assert.fileContent('gulpfile.babel.js', "gulp.watch('app/scripts/**/*.js', ['scripts'])");
      assert.fileContent('gulpfile.babel.js', "'/scripts': 'app/scripts',");
    });

    it('should create a coffee file', function () {
      assert.file('app/scripts/main.coffee');
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
      assert.noFileContent('package.json', '"gulp-coffee"');
    });

    it('shouldn\'t add the scripts task', function () {
      assert.noFileContent('gulpfile.babel.js', "gulp.task('scripts'");
      assert.fileContent('gulpfile.babel.js', "['styles']");
      assert.fileContent('gulpfile.babel.js', "['styles', 'fonts']");
      assert.fileContent('gulpfile.babel.js', "'app/scripts/**/*.js',");
      assert.noFileContent('gulpfile.babel.js', "gulp.watch('app/scripts/**/*.js', ['scripts'])");
      assert.fileContent('gulpfile.babel.js', "'/scripts': 'app/scripts',");
    });

    it('shouldn\'t create a coffee file', function () {
      assert.noFile('app/scripts/main.coffee');
    });
  });
});
