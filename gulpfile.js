'use strict';

var watchify = require('watchify');
var browserify = require('browserify');
var gulp = require('gulp');
var gutil = require('gulp-util');
var connect = require('gulp-connect');
var watch = require('gulp-watch');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var minifyCss = require('gulp-minify-css');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var assign = require('lodash.assign');
var ghPages = require('gulp-gh-pages');

gulp.task('serve', function() {
    connect.server({
      root: 'build',
      port: 8001,
      host: 'localhost',
      livereload: false
    });
});


gulp.task('deploy', function() {
  return gulp.src('./build/**/*')
    .pipe(ghPages());
});


gulp.task('watch' , function() {
  	// JS
	var opts = assign({}, watchify.args, {entries: ['./front/js/app.js'], debug: true });
	var b = watchify(browserify(opts)); 
	b.on('update', bundleJS); // on any dep update, runs the bundler
	b.on('log', gutil.log); // output build logs to terminal

	// CSS
	watch('front/css/*.css', {}, function (e) {
		// console.log('e:'+JSON.stringify(e));
		//console.log('\n');
		console.log(new Date() + ' -- ' + e.history[0].replace(e.base, ''));
		bundleCSS();
	});

	// HTML
    gulp.src('front/index.html')
    .pipe(watch('front/index.html'))
    .pipe(gulp.dest('build'));


	function bundleCSS() {
		gulp.src(['front/css/normalize.css', 'front/css/style.css'])
		.pipe(concat('main.css'))
		.pipe(minifyCss())
		.pipe(gulp.dest('build'));
	}

	function bundleJS() {
	  return b.bundle()
	    // log errors if they happen
	    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
	    .pipe(source('bundle.js'))
	    // optional, remove if you don't need to buffer file contents
	    .pipe(buffer())
	    .pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
	       // Add transformation tasks to the pipeline here.
	    .pipe(sourcemaps.write('./')) // writes .map file
	    .pipe(gulp.dest('build'));
	}

	// generate on init
	bundleJS();
	bundleCSS();
	gulp.src('front/index.html').pipe(gulp.dest('build'));
});
