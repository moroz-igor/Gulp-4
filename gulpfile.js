
const {src,dest,parallel,series,watch}
                    = require('gulp');
const browserSync   = require('browser-sync').create();
const concat        = require('gulp-concat');
const uglify        = require('gulp-uglify-es').default;
const plumber       = require('gulp-plumber');
const pug           = require('gulp-pug');
const sass          = require('gulp-sass');
const cleancss      = require('gulp-clean-css');
const autoprefixer  = require('gulp-autoprefixer');
const imagemin      = require('gulp-imagemin');
const newer         = require('gulp-newer');
const del           = require('del');





function browsersync() {
    browserSync.init({
        server: { baseDir: './dist/'},
        //notify: true,
        online: true
    })
}
function pugCompiler(){
    return src('app/blocks/*.pug')
    .pipe(plumber())
    .pipe(pug({
        pretty: true  // html compressing
    }))
    .pipe(dest('dist/'))
    .pipe(browserSync.stream())
}
function styles(){
    return src([
        'app/blocks/*.scss'
    ])
    .pipe(plumber())
    .pipe(sass())
    .pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true }))
    .pipe(cleancss( { level: { 1: {
        spesialComments: 0 } } , // deleting all comments from css file
        format: 'beautify'       // css compressing
    } ))
    .pipe(dest('dist/css/'))
    .pipe(browserSync.stream())
}

function scripts(){
    return src(
            [
            'app/scripts/**/*.js'
            ]
        )
        .pipe(concat('main.min.js'))
        .pipe(dest('dist/js/'))
        // .pipe(uglify())   // js compressing
        .pipe(browserSync.stream())
}
function jslibs(){
    return src(
            [
            'node_modules/jquery/dist/jquery.min.js',
            'app/jslib/**/*.js'
            ]
        )
        .pipe(dest('dist/jslib/'))
}

function images() {
	return src('app/images/**/*')       // to take all images from the start folder
	.pipe(newer('dist/img/'))           // Checking - Is the image was compressed before
	.pipe(imagemin())                   // compressing of the images
	.pipe(dest('dist/img/'))            // to load of the compressed images in the finish folder
}
function cleandist() {
	return del('dist/**/*', { force: true })
}



/* --- watching changes in the development directories --- */

function watching(){
    watch([
        'app/blocks/**/*.pug'
    ], pugCompiler)
    watch([
        'app/blocks/**/*.scss'
    ], styles)
    watch([
        'app/scripts/**/*.js', '!app/**/*.min.js'
    ], scripts);
    watch('app/images/**/*', images);
}

/* ---- exports of the functions --- */

exports.pugCompiler = pugCompiler;
exports.styles      = styles;
exports.jslibs      = jslibs;
exports.scripts     = scripts;
exports.browsersync = browsersync;
exports.cleandist   = cleandist;
exports.images      = images;


exports.build = series(cleandist, styles, scripts, images);

exports.default = parallel( pugCompiler,
        styles,
        jslibs,
        scripts,
        browsersync,
        watching,
        cleandist,
        images
    );
