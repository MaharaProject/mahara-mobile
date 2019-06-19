/*jshint esnext:true*/
/*globals require:true, console, process*/
"use strict"; /* jshint -W097 */

var minimumNodeVersion = 4;
if (parseFloat(process.version.toString().replace(/[^\.0-9]/, '')) < minimumNodeVersion) {
    console.error("FATAL ERROR: You need to have at least Node.js version " + minimumNodeVersion + " but you have " + process.version);
    process.exit(1);
}

var gulp = require('gulp'),
    concat = require('gulp-concat'),
    browserify = require('browserify'),
    postcss = require('gulp-postcss'),
    replace = require('gulp-replace'),
    source = require("vinyl-source-stream"),
    babelify = require('babelify'),
    glob = require("glob"),
    fs = require("fs"),
    buffer = require('vinyl-buffer'),
    uglify = require('gulp-uglify'),
    sourcemaps = require('gulp-sourcemaps');

var paths = {
    css: './src/**/*.css',
    jsentry: './src/js/index.js',
    lib: './src/lib/**',
    image: './src/image/**',
    font: './src/fonts/**',
    html: './src/*.html',
    ready: './src/ready.js',
    dest: './www',
};

// Informed by https://gist.github.com/alkrauss48/a3581391f120ec1c3e03
gulp.task('js', function () {
    // Process JS files into ES5
    return browserify({
        entries: './src/js/index.js',
        extensions: ['.js'],
        debug: true
    })
    .transform(
        babelify,
        {
            presets: ["@babel/preset-env", "@babel/preset-react"],
            plugins: ["transform-export-extensions", "transform-class-properties"]
        }
    )
    .bundle()
    .pipe(source('bundle.js'))
    // .pipe(buffer())
    // .pipe(sourcemaps.init({loadMaps: true}))
    // .pipe(uglify())
    // .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest(paths.dest));
});

gulp.task('css', function (done) {
    var processors = [
        require('postcss-import'),
        require('postcss-mixins'),
        require('postcss-simple-vars'),
        require('postcss-nested'),
        require('autoprefixer')({ browsers: ['last 2 versions', '> 2%'] })
    ];
    return gulp.src(paths.css)
        .pipe(postcss(processors))
        .pipe(gulp.dest(paths.dest));

});

gulp.task('lib', function () {
    return gulp.src(paths.lib)
        .pipe(gulp.dest(paths.dest + "/lib"));
});

gulp.task('image', function () {
    return gulp.src(paths.image)
        .pipe(gulp.dest(paths.dest + "/image"));
});

gulp.task('font', function () {
    return gulp.src(paths.font)
        .pipe(gulp.dest(paths.dest + '/fonts'));
});

gulp.task('html', function () {
    return gulp.src(paths.html)
        //.pipe(replace(/<!--\#(.*?)\#-->/, ''))
        .pipe(gulp.dest(paths.dest));
});

gulp.task('ready', function () {
    return gulp.src(paths.ready)
        .pipe(gulp.dest(paths.dest));
});

gulp.task('locale', function (done) {
    var allStrings = {};
    glob("./src/i18n/*/strings.txt", function (er, files) {
        var filesRemaining = files.length,
            readLang = function (path) {
                var lang = path.replace(/^.*?i18n\//, '').replace(/\/strings.txt.*?$/, ''),
                    strings = {};

                allStrings[lang] = strings;
                fs.readFile(path, 'utf-8', function (err, data) {
                    var lines = data.split("\n");
                    for (var i = 0; i < lines.length; i++) {
                        var line = lines[i],
                            equals = line.indexOf("=");
                        if (equals >= 0) strings[line.substr(0, equals)] = line.substr(equals + 1);
                    }
                    end();
                });
            },
            end = function () {
                filesRemaining--;
                if (filesRemaining > 0) return;
                fs.mkdir(paths.dest + '/i18n', function (e) {
                    if (e && e.code !== 'EEXIST') console.log(e);
                    fs.writeFile(paths.dest + '/i18n/strings.json', JSON.stringify(allStrings, null, 2), 'utf-8', () => null);
                });
            };

        for (var i = 0; i < files.length; i++) {
            readLang(files[i]);
        }
        done();
    });
});

gulp.task('default', gulp.series(
  'js',
  'css',
  'lib',
  'image',
  'font',
  'html',
  'locale',
  'ready'
));

gulp.task('watch', function() {
    return gulp.watch(['src/*', 'src/**'], gulp.series('default'));
});
