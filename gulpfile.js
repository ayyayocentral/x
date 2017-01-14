var gulp = require('gulp'),
  connect = require('gulp-connect'),
  historyApiFallback = require('connect-history-api-fallback');

gulp.task('connect', function() {
  connect.server({
    root: 'docs',
    livereload: true,
    fallback: 'docs/index.html'
  });
});

gulp.task('html', function () {
  gulp.src('./app/*.html')
    .pipe(connect.reload());
});

gulp.task('watch', function () {
  gulp.watch(['./app/*.html'], ['html']);
});

gulp.task('default', ['connect', 'watch']);