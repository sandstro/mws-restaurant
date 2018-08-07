const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();
const sourcemaps = require('gulp-sourcemaps');
// const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');

var paths = {
  css: {
    src: 'sass/**/*.scss',
    dest: 'dist/css',
    dest_local: 'css'
  },
  js: {
    src: 'js/**/*.js',
    local_dest: 'js',
    dist_dest: 'dist/js'
    // concat: 'all.js'
  }
}

gulp.task('copy-html', function(done) {
  gulp.src('./index.html')
    .pipe(gulp.dest('./dist'));
  gulp.src('./restaurant.html')
    .pipe(gulp.dest('./dist'));
  done();
});

gulp.task('copy-images', function(done) {
  gulp.src('img/**/*')
    .pipe(gulp.dest('dist/img'));
  done();
});

gulp.task('copy-other', function(done) {
  gulp.src(['./sw.js', './manifest.json'])
    .pipe(gulp.dest('./dist'));
  gulp.src(['node_modules/idb/lib/idb.js'])
    .pipe(gulp.dest('./dist/vendor'));
  done();
});

gulp.task('scripts', function() {
  return gulp.src(paths.js.src)
    .pipe(sourcemaps.init())
    .pipe(babel())
    // .pipe(concat(paths.js.concat))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(paths.js.dist_dest));
});

gulp.task('scripts-dist', function() {
  return gulp.src(paths.js.src)
    .pipe(sourcemaps.init())
    .pipe(babel())
    // .pipe(concat(paths.js.concat))
    .pipe(uglify())
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(paths.js.dist_dest));
});

gulp.task('style', function() {
  return gulp.src(paths.css.src)
    .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: 'compressed'
    })).on('error', sass.logError)
    .pipe(autoprefixer({
      browsers: ['last 2 versions']
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.css.dest))
    .pipe(gulp.dest(paths.css.dest_local))
    .pipe(browserSync.stream());
});

gulp.task('dist', gulp.parallel('copy-html', 'copy-images', 'copy-other', style, 'scripts-dist'));

function reload(done) {
  browserSync.reload();
  done();
}

function style() {
  return gulp.src(paths.css.src)
    .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: 'compressed'
    })).on('error', sass.logError)
    .pipe(autoprefixer({
      browsers: ['last 2 versions']
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.css.dest))
    .pipe(gulp.dest(paths.css.dest_local))
    .pipe(browserSync.stream());
}

function watch() {
  style();
  browserSync.init({
    server: {
        baseDir: "./dist"
    },
    port: 8080
  });
  gulp.watch(paths.css.src, style);
  gulp.watch('*.html', reload);
  gulp.watch('*.html', gulp.parallel('copy-html'));
}

exports.style = style
exports.watch = watch
