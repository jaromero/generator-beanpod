'use strict';
var path = require('path');
var helpers = require('yeoman-generator').test;
var assert = require('yeoman-assert');

describe('Sass feature', function () {
  before(function (done) {
    helpers.run(path.join(__dirname, '../app'))
      .inDir(path.join(__dirname, 'temp'))
      .withOptions({'skip-install': true})
      .withPrompts({features: [
        'includeSass'
      ]})
      .on('end', done);
  });

  it('should create an SCSS file', function () {
    assert.file('app/styles/main.scss');
  });

  it('should create a scss-lint.yml file', function () {
    assert.file('scss-lint.yml');
  });

  it('should contain necessary tasks', function () {
    assert.fileContent('gulpfile.babel.js', 'gulp.task(\'scsslint');

  it('should add dependencies', function () {
    assert.fileContent('package.json', '"gulp-sass"');
    assert.fileContent('package.json', '"gulp-plumber"');
  });

});
