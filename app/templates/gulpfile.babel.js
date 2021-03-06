// generated on <%= date %> using <%= name %> <%= version %>
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import browserSync from 'browser-sync';
import del from 'del';
import {stream as wiredep} from 'wiredep';

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

gulp.task('styles', () => {
  return gulp.src('app/styles/*.scss')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.sass.sync({
      outputStyle: 'expanded',
      precision: 10,<% if (customBootstrap) { %>
      includePaths: [
        '.',
        'bower_components/bootstrap-sass/assets/stylesheets'
      ]<% } else { -%>
      includePaths: ['.']<% } %>
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer({browsers: ['> 1%', 'last 1 versions', 'Firefox ESR']}))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('.tmp/styles'))
    .pipe(reload({stream: true}));
});

<% if (includeBabel) { -%>
gulp.task('scripts', () => {
  return gulp.src('app/scripts/**/*.js')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.babel())
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('.tmp/scripts'))
    .pipe(reload({stream: true}));
});<% } -%>

<% if (includeCoffee) { -%>
gulp.task('scripts', () => {
  return gulp.src('app/scripts/**/*.{coffee,litcoffee}')
    .pipe($.sourcemaps.init())
    .pipe($.coffee()).on('error', function(err) { console.log('Error!', err.message)})
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('.tmp/scripts'))
    .pipe(reload({stream: true}));
});<% } -%>

<% if (includeJade) { -%>
gulp.task('views', () => {
  return gulp.src('app/*.jade')
    .pipe($.plumber())
    .pipe($.jade({pretty: true}))
    .on('error', (err) => {
      console.log('Error!', err.message)})
    .pipe(gulp.dest('.tmp'))
    .pipe(reload({stream: true}));
});<% } %>

function eslint(files, options) {
  return () => {
    return gulp.src(files)
      .pipe(reload({stream: true, once: true}))
      .pipe($.eslint(Object.assign({}, options, {
        configFile: '.eslintrc.json'
      })))
      .pipe($.eslint.format())
      .pipe($.if(!browserSync.active, $.eslint.failAfterError()));
  };
}

<% if (includeCoffee) { -%>
function coffeelint(files, options) {
  return () => {
    return gulp.src(files)
    .pipe(reload({stream: true, once: true}))
    .pipe($.coffeelint(options))
    .pipe($.coffeelint.reporter(require('coffeelint-stylish')))
    .pipe($.if(!browserSync.active, $.coffeelint.reporter('fail')));
  };
}<% } -%>

function scsslint(files, options) {
  return () => {
    return gulp.src(files)
      .pipe(reload({stream: true, once: true}))
      .pipe($.scssLint(Object.assign({}, options, {
        config: '.scss-lint.yml',
        reporterOutputFormat: 'Checkstyle'
      })))
      .pipe($.if(!browserSync.active, $.scssLint.failReporter('E')));
  };
}

const testLintOptions = {
  env: {
<% if (testFramework === 'mocha') { -%>
    mocha: true
<% } else if (testFramework === 'jasmine') { -%>
    jasmine: true
<% } -%>
  }
};

gulp.task('eslint', eslint('app/scripts/**/*.js'));
gulp.task('eslint:test', eslint('test/spec/**/*.js', testLintOptions));
<% if (includeCoffee) { %>
gulp.task('coffeelint', coffeelint('app/scripts/**/*.coffee'));
<% } %>
gulp.task('scsslint', scsslint('app/styles/**/*.scss'));

gulp.task('lint', ['eslint', 'coffeelint', 'scsslint']);

gulp.task('html', ['styles'<% if (includeJSVariant) { %>, 'scripts'<% } %><% if (includeJade) { %>, 'views'<% } %>], () => {
  <% if (includeJade) { -%>
  return gulp.src(['app/*.html', '.tmp/*.html'])<% } else { %>
  return gulp.src('app/*.html')<% } %>
    .pipe($.useref({searchPath: ['.tmp', 'app', '.']}))
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.cssnano()))
    .pipe($.if('*.html', $.htmlmin({collapseWhitespace: true})))
    .pipe(gulp.dest('dist'));
});

gulp.task('images', () => {
  return gulp.src('app/images/**/*')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true,
      // don't remove IDs from SVGs, they are often used
      // as hooks for embedding and styling
      svgoPlugins: [{cleanupIDs: false}]
    })))
    .pipe(gulp.dest('dist/images'));
});

gulp.task('fonts', () => {
  return gulp.src(require('main-bower-files')('**/*.{eot,svg,ttf,woff,woff2}', function (err) {})
    .concat('app/fonts/**/*'))
    .pipe(gulp.dest('.tmp/fonts'))
    .pipe(gulp.dest('dist/fonts'));
});

gulp.task('extras', () => {
  return gulp.src([
    'app/*.*',
    '!app/*.html'<% if (includeJade) { %>,
    '!app/*.jade'<% } %>
  ], {
    dot: true
  }).pipe(gulp.dest('dist'));
});

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('browser', ['styles', 'fonts'<% if (includeJSVariant) { %>, 'scripts'<% } %><% if (includeJade) { %>, 'views'<% } %>], () => {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['.tmp', 'app'],
      routes: {
        '/bower_components': 'bower_components'
      }
    }
  });
});

gulp.task('browser:e2e', ['styles', 'fonts'<% if (includeJSVariant) { %>, 'scripts'<% } %><% if (includeJade) { %>, 'views'<% } %>], () => {
  browserSync({
    notify: false,
    port: 9000,
    ui: false,
    open: false,
    server: {
      baseDir: ['.tmp', 'app'],
      routes: {
        '/bower_components': 'bower_components'
      }
    }
  });
});

gulp.task('serve', ['browser'], () => {
  gulp.watch([
    'app/*.html',<% if (includeJade) { %>
    '.tmp/*.html',<% } %><% if (!includeBabel) { %>
    'app/scripts/**/*.js',<% } %>
    'app/images/**/*',
    '.tmp/fonts/**/*'
  ]).on('change', reload);
  <% if (includeJade) { %>
  gulp.watch('app/**/*.jade', ['views']);<% } %>
  gulp.watch('app/styles/**/*.scss', ['styles']);<% if (includeBabel) { %>
  gulp.watch('app/scripts/**/*.js', ['scripts']);
  <% } else if (includeCoffee) { %>
  gulp.watch('app/scripts/**/*.{coffee,litcoffee}', ['scripts']);
  <% } -%>
  gulp.watch('app/fonts/**/*', ['fonts']);
  gulp.watch('bower.json', ['wiredep', 'fonts']);
});

gulp.task('serve:e2e', ['browser:e2e']);

gulp.task('serve:dist', () => {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['dist']
    }
  });
});

<% if (includeJSVariant) { -%>
gulp.task('serve:test', ['scripts'], () => {
<% } else { -%>
gulp.task('serve:test', () => {
<% } -%>
  browserSync({
    notify: false,
    port: 9000,
    ui: false,
    server: {
      baseDir: 'test',
      routes: {
<% if (includeBabel) { -%>
        '/scripts': '.tmp/scripts',
<% } else { -%>
        '/scripts': 'app/scripts',
<% } -%>
        '/bower_components': 'bower_components'
      }
    }
  });

<% if (includeJSVariant) { -%>
  gulp.watch('app/scripts/**/*.js', ['scripts']);
<% } -%>
  gulp.watch('test/spec/**/*.js').on('change', reload);
  gulp.watch('test/spec/**/*.js', ['eslint:test']);
});

const webdriverOpts = {
  desiredCapabilities: {
    browserName: 'firefox'
  },
  seleniumOptions: {
    version: '2.47.1'
  },
  seleniumInstallOptions: {
    version: '2.47.1',
    baseURL: 'http://selenium-release.storage.googleapis.com'
  }
};

gulp.task('e2e', ['serve:e2e'], () => {
  return gulp.src('e2e/**/*.js', { read: false })
    .pipe($.webdriver(webdriverOpts))
    .once('end', function () {
      browserSync.exit();
    });
});

gulp.task('e2e:chrome', ['serve:e2e'], () => {
  return gulp.src('e2e/**/*.js', { read: false })
    .pipe($.webdriver(Object.assign({}, webdriverOpts, {
      desiredCapabilities: {
        browserName: 'chrome'
      },
      seleniumInstallOptions: {
        drivers: {
          chrome: {
            version: '2.18',
            arch: process.arch,
            baseURL: 'http://chromedriver.storage.googleapis.com'
          }
        }
      }
    })))
    .once('end', function () {
      browserSync.exit();
    });
});

// inject bower components
gulp.task('wiredep', () => {
  gulp.src('app/styles/*.scss')
    .pipe(wiredep({<% if (customBootstrap) { %>
      exclude: ['bootstrap-sass'],<% } %>
      ignorePath: /^(\.\.\/)+/
    }))
    .pipe(gulp.dest('app/styles'));
<% if (includeJade) { %>
  gulp.src('app/layouts/*.jade')<% } else { %>
  gulp.src('app/*.html')<% } %>
    .pipe(wiredep({<% if (includeBootstrap) { %>
      exclude: ['bootstrap-sass'],<% } %>
      ignorePath: /^(\.\.\/)*\.\./
    }))<% if (includeJade) { %>
    .pipe(gulp.dest('app/layouts'));<% } else { %>
    .pipe(gulp.dest('app'));<% } %>
});

gulp.task('build', ['lint', 'html', 'images', 'fonts', 'extras'], () => {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', ['clean'], () => {
  gulp.start('build');
});
