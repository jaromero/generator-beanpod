'use strict';
var generators = require('yeoman-generator');
var yosay = require('yosay');
var chalk = require('chalk');
var wiredep = require('wiredep');
var mkdirp = require('mkdirp');
var _s = require('underscore.string');

module.exports = generators.Base.extend({
  constructor: function () {
    var testLocal;

    generators.Base.apply(this, arguments);

    this.option('skip-welcome-message', {
      desc: 'Skips the welcome message',
      type: Boolean
    });

    this.option('skip-install-message', {
      desc: 'Skips the message after the installation of dependencies',
      type: Boolean
    });

    this.option('test-framework', {
      desc: 'Test framework to be invoked',
      type: String,
      defaults: 'mocha'
    });

    if (this.options['test-framework'] === 'mocha') {
      testLocal = require.resolve('generator-mocha/generators/app/index.js');
    } else if (this.options['test-framework'] === 'jasmine') {
      testLocal = require.resolve('generator-jasmine/generators/app/index.js');
    }

    this.composeWith(this.options['test-framework'] + ':app', {
      options: {
        'skip-install': this.options['skip-install']
      }
    }, {
      local: testLocal
    });
  },

  initializing: function () {
    this.pkg = require('../package.json');
  },

  prompting: function () {
    var done = this.async();

    if (!this.options['skip-welcome-message']) {
      this.log(yosay('\'Allo \'allo! Out of the box I include HTML5 Boilerplate, jQuery, and a gulpfile to build your app.'));
    }

    var prompts = [{
      type: 'checkbox',
      name: 'features',
      message: 'What more would you like?',
      choices: [{
        name: 'Bootstrap',
        value: 'includeBootstrap',
        checked: true
      }, {
        name: 'Modernizr',
        value: 'includeModernizr',
        checked: true
      }, {
        name: 'Jade',
        value: 'includeJade',
        checked: true
      }, {
        name: 'Gulpfile in CoffeeScript',
        value: 'coffeeGulpfile',
        checked: false
      }]
    }, {
      type: 'confirm',
      name: 'includeJQuery',
      message: 'Would you like to include jQuery?',
      default: true,
      when: function (answers) {
        return answers.features.indexOf('includeBootstrap') === -1;
      }
    }];

    this.prompt(prompts, function (answers) {
      var features = answers.features;

      function hasFeature (feat) {
        return features && features.indexOf(feat) !== -1;
      }

      // manually deal with the response, get back and store the results.
      // we change a bit this way of doing to automatically do this in the self.prompt() method.
      this.includeBootstrap = hasFeature('includeBootstrap');
      this.includeModernizr = hasFeature('includeModernizr');
      this.includeJade = hasFeature('includeJade');
      this.coffeeGulpfile = hasFeature('coffeeGulpfile');
      this.includeJQuery = answers.includeJQuery;

      done();
    }.bind(this));
  },

  writing: {
    gulpfile: function () {
      var gulpfileTpl, gulpfileDest;

      if (this.coffeeGulpfile) {
        gulpfileTpl = this.templatePath('gulpfile.coffee');
        gulpfileDest = this.destinationPath('gulpfile.coffee');
      } else {
        gulpfileTpl = this.templatePath('gulpfile.babel.js');
        gulpfileDest = this.destinationPath('gulpfile.babel.js');
      }

      this.fs.copyTpl(
        gulpfileTpl,
        gulpfileDest,
        {
          date: (new Date).toISOString().split('T')[0],
          name: this.pkg.name,
          version: this.pkg.version,
          includeBootstrap: this.includeBootstrap,
          includeJade: this.includeJade,
          testFramework: this.options['test-framework']
        }
      );
    },

    packageJSON: function () {
      this.fs.copyTpl(
        this.templatePath('_package.json'),
        this.destinationPath('package.json'),
        {
          includeJade: this.includeJade,
          coffeeGulpfile: this.coffeeGulpfile
        }
      );
    },

    git: function () {
      this.fs.copy(
        this.templatePath('gitignore'),
        this.destinationPath('.gitignore'));

      this.fs.copy(
        this.templatePath('gitattributes'),
        this.destinationPath('.gitattributes'));
    },

    bower: function () {
      var bowerJson = {
        name: _s.slugify(this.appname),
        private: true,
        dependencies: {}
      };

      if (this.includeBootstrap) {
        bowerJson.dependencies['bootstrap-sass'] = '~3.3.5';
        bowerJson.overrides = {
          'bootstrap-sass': {
            'main': [
              'assets/stylesheets/_bootstrap.scss',
              'assets/fonts/bootstrap/*',
              'assets/javascripts/bootstrap.js'
            ]
          }
        };
      } else if (this.includeJQuery) {
        bowerJson.dependencies['jquery'] = '~2.1.1';
      }

      if (this.includeModernizr) {
        bowerJson.dependencies['modernizr'] = '~2.8.1';
      }

      this.fs.writeJSON('bower.json', bowerJson);
      this.fs.copy(
        this.templatePath('bowerrc'),
        this.destinationPath('.bowerrc')
      );
    },

    editorConfig: function () {
      this.fs.copy(
        this.templatePath('editorconfig'),
        this.destinationPath('.editorconfig')
      );
    },

    h5bp: function () {
      this.fs.copy(
        this.templatePath('favicon.ico'),
        this.destinationPath('app/favicon.ico')
      );

      this.fs.copy(
        this.templatePath('apple-touch-icon.png'),
        this.destinationPath('app/apple-touch-icon.png')
      );

      this.fs.copy(
        this.templatePath('robots.txt'),
        this.destinationPath('app/robots.txt'));
    },

    styles: function () {
      this.fs.copyTpl(
        this.templatePath('main.scss'),
        this.destinationPath('app/styles/main.scss'),
        {
          includeBootstrap: this.includeBootstrap
        }
      );

      this.fs.copy(
        this.templatePath('scss-lint.yml'),
        this.destinationPath('scss-lint.yml')
      );
    },

    scripts: function () {
      this.fs.copy(
        this.templatePath('main.coffee'),
        this.destinationPath('app/scripts/main.coffee')
      );

      this.fs.copy(
        this.templatePath('coffeelint.json'),
        this.destinationPath('coffeelint.json')
      );

      this.fs.copy(
        this.templatePath('eslint.json'),
        this.destinationPath('eslint.json')
      );
    },

    html: function () {
      var bsPath, bsPlugins, tplOptions;

      // path prefix for Bootstrap JS files
      bsPath = '/bower_components/bootstrap-sass/assets/javascripts/bootstrap/';

      bsPlugins = [
        'affix',
        'alert',
        'dropdown',
        'tooltip',
        'modal',
        'transition',
        'button',
        'popover',
        'carousel',
        'scrollspy',
        'collapse',
        'tab'
      ];

      tplOptions = {
        appname: this.appname,
        includeBootstrap: this.includeBootstrap,
        includeModernizr: this.includeModernizr,
        includeJQuery: this.includeJQuery,
        bsPath: bsPath,
        bsPlugins: bsPlugins
      };

      if (this.includeJade) {
        this.fs.copyTpl(
          this.templatePath('default.jade'),
          this.destinationPath('app/layouts/default.jade'),
          tplOptions
        );
        this.fs.copyTpl(
          this.templatePath('index.jade'),
          this.destinationPath('app/index.jade'),
          tplOptions
        );
      } else {
        this.fs.copyTpl(
          this.templatePath('index.html'),
          this.destinationPath('app/index.html'),
          tplOptions
        );
      }
    },

    webdriver: function () {
      this.fs.copyTpl(
        this.templatePath('e2e-index-test.js'),
        this.destinationPath('e2e/index/test.js'),
        {
          appname: this.appname
        }
      );
    },

    misc: function () {
      mkdirp('app/images');
      mkdirp('app/fonts');
    }
  },

  install: function () {
    this.installDependencies({
      skipMessage: this.options['skip-install-message'],
      skipInstall: this.options['skip-install']
    });
  },

  end: function () {
    var bowerJson, howToInstall, wiredepOpts;

    bowerJson = this.fs.readJSON(this.destinationPath('bower.json'));
    howToInstall =
      '\nAfter running ' +
      chalk.yellow.bold('npm install & bower install') +
      ', inject your' +
      '\nfront end dependencies by running ' +
      chalk.yellow.bold('gulp wiredep') +
      '.';

    if (this.options['skip-install']) {
      this.log(howToInstall);
      return;
    }

    // wire Bower packages to .html
    wiredepOpts = {
      bowerJson: bowerJson,
      directory: 'bower_components',
      exclude: ['bootstrap-sass', 'bootstrap.js'],
      ignorePath: /^(\.\.\/)*\.\./,
      src: 'app/index.html'
    };

    if (this.includeJade) {
      wiredepOpts.src = 'app/layouts/default.jade';
    }

    wiredep(wiredepOpts);

    // wire Bower packages to .scss
    wiredep({
      bowerJson: bowerJson,
      directory: 'bower_components',
      ignorePath: /^(\.\.\/)+/,
      src: 'app/styles/*.scss'
    });
  }
});
