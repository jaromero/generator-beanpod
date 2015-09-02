# generated on <%= date %> using <%= name %> <%= version %>
gulp = require 'gulp'
browserSync = require 'browser-sync'
del = require 'del'
wiredep = require('wiredep').stream

reload = browserSync.reload

$ = require('gulp-load-plugins')()

gulp.task 'styles', -><% if (includeSass) { %>
  gulp.src 'app/styles/*.scss'
    .pipe $.plumber()
    .pipe $.sourcemaps.init()
    .pipe $.sass.sync
      outputStyle: 'expanded'
      precision: 10
      includePaths: ['.']
    .on 'error', $.sass.logError<% } else { %>
  gulp.src 'app/styles/*.css'
    .pipe $.sourcemaps.init()<% } %>
    .pipe $.autoprefixer {browsers: ['last 1 version']}
    .pipe $.sourcemaps.write()
    .pipe gulp.dest '.tmp/styles'
    .pipe reload {stream: true}

gulp.task 'scripts', ->
  gulp.src 'app/scripts/**/*.{coffee,litcoffee}'
    .pipe $.coffee()
    .on 'error', (err) ->
      console.log 'Error!', err.message
    .pipe gulp.dest '.tmp/scripts'
<% if (includeJade) { %>
gulp.task 'views', ->
  gulp.src 'app/*.jade'
    .pipe $.jade {pretty: true}
    .pipe gulp.dest '.tmp'
    .pipe reload {stream: true}<% } %>

eslint = (files, opts) ->
  ->
    gulp.src files
      .pipe reload {stream: true, once: true}
      .pipe $.eslint opts
      .pipe $.eslint.format()
      .pipe $.if (not browserSync.active), $.eslint.failAfterError()

coffeelint = (files, opts) ->
  ->
    gulp.src files
      .pipe reload {stream: true, once: true}
      .pipe $.coffeelint opts
      .pipe $.coffeelint.reporter require 'coffeelint-stylish'
      .pipe $.if (not browserSync.active), $.coffeelint.reporter 'fail'
<% if (includeSass) { %>
scsslint = (files, opts) ->
  ->
    assign = require 'lodash.assign'
    gulp.src files
      .pipe reload {stream: true, once: true}
      .pipe $.scsslint assign {}, opts,
        config: 'scss-lint.yml'
        reporterOutputFormat: 'Checkstyle'
      .pipe $.if (not browserSync.active), $.scssLint.failReporter 'E'<% } %>

testLintOptions =
  env:
    <% if (testFramework === 'mocha') { %>mocha: true<% } %>
    <% if (testFramework === 'jasmine') { %>jasmine: true<% } %>

gulp.task 'eslint', eslint 'app/scrips/**/*.js'
gulp.task 'eslint:test', eslint 'test/spec/**/*.js'

gulp.task 'coffeelint', coffeelint 'app/scripts/**/*.coffee'
<% if (includeSass) { %>
gulp.task 'scsslint', scsslint 'app/styles/**/*.scss'<% } %>

gulp.task 'lint', ['eslint', 'coffeelint'<% if (includeSass) { %>, 'scsslint'<% } %>]

gulp.task 'html', ['styles', 'scripts'<% if (includeJade) { %>, 'views'<% } %>], ->
  assets = $.useref.assets {searchPath: ['.tmp', 'app', '.']}
  <% if (includeJade) { %>
  return gulp.src ['app/*.html', '.tmp/*.html']<% } else { %>
  return gulp.src 'app/*.html'<% } %>
    .pipe assets
    .pipe $.if '*.js', $.uglify()
    .pipe $.if '*.css', $.minifyCss {compatibility: '*'}
    .pipe assets.restore()
    .pipe $.useref()
    .pipe $.if '*.html', $.minifyHtml {conditionals: true, loose: true}
    .pipe gulp.dest 'dist'

gulp.task 'images', ->
  gulp.src 'app/images/**/*'
    .pipe $.if $.if.isFile, $.cache $.imagemin
      progressive: true
      interlaced: true
      # don't remove IDs from SVGs, they are often used
      # as hooks for embedding and styling
      svgoPlugins: [{cleanupIDs: false}]
    .on 'error', (err) ->
      console.log err
      this.end()
    .pipe gulp.dest 'dist/images'

gulp.task 'fonts', ->
  bowerFiles = require 'main-bower-files'

  gulp.src bowerFiles('**/*.{eot,svg,ttf,woff,woff2}', (err) -> undefined).concat 'app/fonts/**/*'
    .pipe gulp.dest '.tmp/fonts'
    .pipe gulp.dest 'dist/fonts'

gulp.task 'extras', ->
  gulp.src [
    'app/*.*'
    '!app/*.html'<% if (includeJade) { %>
    '!app/*.jade'<% } %>
  ],
    dot: true
  .pipe gulp.dest 'dist'

gulp.task 'clean', del.bind null, ['.tmp', 'dist']

gulp.task 'browser', ['styles', 'fonts', 'scripts'<% if (includeJade) { %>, 'views'<% } %>], ->
  browserSync
    notify: false
    port: 9000
    server:
      baseDir: ['.tmp', 'app']
      routes:
        '/bower_components': 'bower_components'

gulp.task 'browser:e2e', ['styles', 'fonts', 'scripts'<% if (includeJade) { %>, 'views'<% } %>], ->
  browserSync
    notify: false
    port: 9000
    ui: false
    open: false
    server:
      baseDir: ['.tmp', 'app']
      routes:
        '/bower_components': 'bower_components'

gulp.task 'serve', ['browser'], ->
  gulp.watch [
    'app/*.html'<% if (includeJade) { %>
    '.tmp/*.html'<% } %>
    'app/scripts/**/*.js'
    '.tmp/scripts/**/*.js'
    'app/images/**/*'
    '.tmp/fonts/**/*'
  ]
  .on 'change', reload
  <% if (includeJade) { %>
  gulp.watch 'app/**/*.jade', ['views']<% } %>
  gulp.watch 'app/styles/**/*.<%= includeSass ? 'scss' : 'css' %>', ['styles']
  gulp.watch 'app/scripts/**/*.{coffee,litcoffee}', ['scripts']
  gulp.watch 'app/fonts/**/*', ['fonts']
  gulp.watch 'bower.json', ['wiredep', 'fonts']

gulp.task 'serve:e2e', ['browser:e2e']

gulp.task 'serve:dist', ->
  browserSync
    notify: false
    port: 9000
    server:
      baseDir: ['dist']

gulp.task 'serve:test', ->
  browserSync
    notify: false
    port: 9000
    ui: false
    server:
      baseDir: 'test'
      routes:
        '/bower_components': 'bower_components'

  gulp.watch('test/spec/**/*.js').on 'change', reload
  gulp.watch 'test/spec/**/*.js', ['eslint:test']

gulp.task 'e2e', ['serve:e2e'], ->
  gulp.src 'e2e/**/*.js', {read: false}
    .pipe $.webdriver
      desiredCapabilities:
        browserName: 'firefox'
      seleniumOptions:
        version: '2.47.1'
      seleniumInstallOptions:
        version: '2.47.1'
        baseURL: 'http://selenium-release.storage.googleapis.com'
    .once 'end', ->
      browserSync.exit()

gulp.task 'e2e:chrome', ['serve:e2e'], ->
  gulp.src 'e2e/**/*.js', {read: false}
    .pipe $.webdriver
      desiredCapabilities:
        browserName: 'firefox'
      seleniumOptions:
        version: '2.47.1'
      seleniumInstallOptions:
        version: '2.47.1'
        baseURL: 'http://selenium-release.storage.googleapis.com'
        drivers:
          chrome:
            version: '2.18'
            arch: process.arch
            baseURL: 'http://chromedriver.storage.googleapis.com'
    .once 'end', ->
      browserSync.exit()

# inject bower components
gulp.task 'wiredep', -><% if (includeSass) { %>
  gulp.src 'app/styles/*.scss'
    .pipe wiredep
      ignorePath: /^(\.\.\/)+/
    .pipe gulp.dest 'app/styles'
<% } if (includeJade) { %>
  gulp.src 'app/layouts/*.jade'<% } else { %>
  gulp.src 'app/*.html'<% } %>
    .pipe wiredep<% if (includeBootstrap) { if (includeSass) { %>
      exclude: ['bootstrap-sass']<% } else { %>
      exclude: ['bootstrap.js']<% }} %>
      ignorePath: /^(\.\.\/)*\.\./
    .pipe gulp.dest 'app'

gulp.task 'build', ['lint', 'html', 'images', 'fonts', 'extras'], ->
  gulp.src 'dist/**/*'
    .pipe $.size {title: 'build', gzip: true}

gulp.task 'default', ['clean'], ->
  gulp.start 'build'
