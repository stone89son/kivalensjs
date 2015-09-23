//KIVALENS REACT
var gulp = require('gulp'),
    plumber = require('gulp-plumber'),
    rename = require('gulp-rename');
var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
//var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var minifycss = require('gulp-minify-css');
var sass = require('gulp-sass');
var browserSync = require('browser-sync');

var browserify = require('browserify');
var watchify = require('watchify');
var notify = require("gulp-notify");
var babelify = require('babelify');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var literalify = require('literalify');

/**
 * "browserify": {
    "transform": [
      "browserify-shim"
    ]
  },
 "browserify-shim": {
    "react": "global:React",
    "react/addons": "global:React",
    "react-bootstrap": "global:ReactBootstrap",
    "reflux": "global:Reflux"
  },
 */

/**
 * "transform": [
 "browserify-shim"
 ]
 *
 * "react": "^0.13.3",
 * "react-bootstrap": "^0.25.2",
 *
"browserify-shim": {
    "jquery": "$",
        "react": "global:React",
        "react-bootstrap": "global:ReactBootstrap",
        "react-router": "global:ReactRouter",
        "reflux": "global:Reflux"
},**/

gulp.task('browser-sync', function() {
  browserSync({
    server: {
        baseDir: "./"
        //,proxy: "localhost:8000"
        //,port: 8000
    }
  });
});

gulp.task('bs-reload', function () {
  browserSync.reload();
});

gulp.task('styles', function(){
  gulp.src(['src/styles/**/*.scss'])
    .pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
    }}))
    .pipe(sass())
    //.pipe(postcss([autoprefixer]).process())
    .pipe(autoprefixer('last 2 versions'))
    .pipe(gulp.dest('css/'))
    .pipe(rename({suffix: '.min'}))
    .pipe(minifycss())
    .pipe(gulp.dest('css/'))
    .pipe(browserSync.reload({stream:true}))
});

var libs = {
    "react": "window.React",
    "react/addons": "window.React",
    "react-bootstrap": "window.ReactBootstrap",
    "reflux": "window.Reflux"
};
//.transform(literalify.configure(libs))

function compile(watch) {
    var bundler = browserify('./src/scripts/app.js',
        { debug: true }).transform(babelify);
    if (watch) {
        bundler = watchify(bundler);
    }
    //bundler.exclude("react");
    //bundler.exclude("react-bootstrap");
    //bundler.external("react-router");

    function rebundle() {
        bundler.bundle()
            .on('error', function(err) {
                notify('An error occurred during building. Check the console for details.');
                console.error(err); this.emit('end');
            })
            .pipe(source('build.js'))
            .pipe(buffer())
            //.pipe(uglify({output: {ascii_only:true}}))
            .pipe(sourcemaps.init({ loadMaps: true }))
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest('./javascript'))
            .pipe(browserSync.reload({stream:true}))
    }

    if (watch) {
        console.log('watching for changes...');
        bundler.on('update', function() {
            notify("Change Detected");
            console.log('-> change:bundling...');
            rebundle();
            console.log('-> done.');
            console.log('waiting...');
            notify("Done");
        });
    }

    rebundle();
}

gulp.task('scripts', function() { return compile(false); });

gulp.task('default', ['styles','scripts', 'browser-sync'], function(){
  gulp.watch("src/styles/**/*.scss", ['styles']);
  gulp.watch("src/scripts/**/*.jsx", ['scripts']);
  gulp.watch("src/scripts/**/*.js", ['scripts']);
  gulp.watch("*.html", ['bs-reload']);
});

