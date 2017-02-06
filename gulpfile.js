/**
 * Created by M1rotvorez on 2/6/17.
 */
var gulp = require('gulp'),
		postcss = require('gulp-postcss'),
		autoprefixer = require('autoprefixer'),
		precss = require('precss'),
		sass = require('gulp-sass'),
		cssnano = require('cssnano');

gulp.task('css', function () {
		var processors = [
				autoprefixer,
				cssnano(),
				precss
		];
		return gulp.src('./public/css/*.scss')
				.pipe(sass().on('error', sass.logError))
				.pipe(postcss(processors))
				.pipe(gulp.dest('./public/dist/'));
});

gulp.task('watch', function() {
		gulp.watch('./public/css/*.scss', ['css']);
});

gulp.task('build', ['css']);
