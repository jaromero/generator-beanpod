'use strict';
var path = require('path');
var helpers = require('yeoman-generator').test;
var assert = require('yeoman-assert');

describe('Jade feature', function () {
  describe('on', function () {
    before(function (done) {
      helpers.run(path.join(__dirname, '../app'))
        .inDir(path.join(__dirname, 'temp'))
        .withOptions({'skip-install': true})
        .withPrompts({features: [
          'includeJade'
        ]})
        .on('end', done);
    });

    it('should create a Jade default layout file', function () {
      assert.file('app/layouts/default.jade');
    });

    it('should create a Jade index file', function () {
      assert.file('app/index.jade');
    });
  });

  describe('off', function () {
    before(function (done) {
      helpers.run(path.join(__dirname, '../app'))
        .inDir(path.join(__dirname, 'temp'))
        .withOptions({'skip-install': true})
        .withPrompts({features: []})
        .on('end', done);
    });

    it('should create an index.html file', function () {
      assert.file('app/index.html');
    });
  });
});
