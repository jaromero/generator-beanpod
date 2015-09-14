> [Yeoman](http://yeoman.io) generator that scaffolds out a front-end web app using [gulp](http://gulpjs.com/) for the build process

![](screenshot.png)

## Why beanpod?

Jade is green, coffee is beans, and I'm not actually that creative.

## Features

Please see our [gulpfile](app/templates/gulpfile.babel.js) for up to date information on what we support.

* CSS Autoprefixing
* Built-in preview server with BrowserSync
* Templating with [jade](http://jade-lang.com)
* Automagically compile Sass with [libsass](http://libsass.org)
* Lint your scripts and styles with [coffeelint](http://www.coffeelint.org/) and [scss-lint](https://github.com/brigade/scss-lint)
* Map compiled CSS to source stylesheets with source maps
* Awesome image optimization
* Automagically wire-up dependencies installed with [Bower](http://bower.io)
* CoffeeScript support enabled by default
* E2E testing using [webdriver](http://webdriver.io)
* A gulpfile that makes use of [ES2015 features](https://babeljs.io/docs/learn-es2015/) by using [Babel](https://babeljs.io) (an optional gulpfile in coffeescript is available)

*For more information on what this generator can do for you, take a look at the [gulp plugins](app/templates/_package.json) used in our `package.json`.*


## libsass

Keep in mind that libsass is feature-wise not fully compatible with Ruby Sass. Check out [this](http://sass-compatibility.github.io) curated list of incompatibilities to find out which features are missing.

If your favorite feature is missing and you really need Ruby Sass, you can always switch to [gulp-ruby-sass](https://github.com/sindresorhus/gulp-ruby-sass) and update the `styles` task in gulpfile accordingly.


## Getting Started

- Install dependencies: `npm install --global yo gulp bower`
- Install the generator: `npm install --global generator-beanpod`
- Run `yo beanpod` to scaffold your webapp
- Run `gulp serve` to preview and watch for changes
- Run `bower install --save <package>` to install frontend dependencies
- Run `gulp serve:test` to run the tests in the browser
- Run `gulp e2e` to run E2E tests in Firefox, or `gulp e2e:chrome` to use Chrome
- Run `gulp` to build your webapp for production
- Run `gulp serve:dist` to preview the production build


## Docs

* [getting started](docs/README.md) with this generator
* [recipes](docs/recipes/README.md) for integrating other popular technologies like Less or React
* [details](docs/bower.md) about our Bower setup


## Options

- `--skip-welcome-message`
  Skips Yeoman's greeting before displaying options.
- `--skip-install-message`
  Skips the the message displayed after scaffolding has finished and before the dependencies are being installed.
- `--skip-install`
  Skips the automatic execution of `bower` and `npm` after scaffolding has finished.
- `--test-framework=<framework>`
  Either `mocha` or `jasmine`. Defaults to `mocha`.


## Contribute

See the [contributing docs](contributing.md).


## License

[BSD license](http://opensource.org/licenses/bsd-license.php)
