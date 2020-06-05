import gulp from "gulp";
import del from "del";
import sass from "gulp-sass";
import autoPrefixer from "gulp-autoprefixer";
import minify from "gulp-csso";
import browserify from "gulp-browserify";
import babelify from "babelify";

sass.compiler = require("node-sass");

const routes = {
  scss: {
    watch: "src/assets/scss/**/*.scss",
    src: "src/assets/scss/styles.scss",
    dest: "src/static/css",
  },
  js: {
    watch: "src/assets/js/**/*.js",
    src: "src/assets/js/main.js",
    dest: "src/static/js",
  },
};

const clean = () => del(["src/static"]);

const styles = () =>
  gulp
    .src(routes.scss.src)
    .pipe(sass().on("error", sass.logError))
    .pipe(autoPrefixer({ cascade: false }))
    .pipe(minify())
    .pipe(gulp.dest(routes.scss.dest));

export const js = () =>
  gulp
    .src(routes.js.src)
    .pipe(
      browserify({
        transform: [
          babelify.configure({
            presets: ["@babel/preset-env"],
          }),
        ],
      })
    )
    .pipe(gulp.dest(routes.js.dest));

const watch = () => {
  gulp.watch(routes.scss.watch, styles);
  gulp.watch(routes.js.watch, js);
};

export const dev = gulp.series([clean, styles, js, watch]);
