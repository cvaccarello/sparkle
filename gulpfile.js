var gulp = require('gulp');
var uglify = require('gulp-uglify');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var babel = require('gulp-babel');
var concat = require('gulp-concat');

var js_files_location = 'src/**/*.js';

var minifyJS = () => {
	// generate min particle system file & mappings file
	gulp.src(js_files_location)
		.pipe(sourcemaps.init())
		.pipe(babel({
			presets: ['es2015']
		}))
		.pipe(concat('particle-system.min.js'))
		.pipe(uglify().on('error', gutil.log))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('dist'));
};


/******************************/
/****   Setup Gulp Tasks   ****/
/******************************/

// default task to watch and minify javascript files (also produces an optional map file to use)
gulp.task('default', function() {
	minifyJS();

	gulp.watch(js_files_location, function() {
		console.log('minifying started');
		minifyJS();
		console.log('minifying finished');
	})
});
