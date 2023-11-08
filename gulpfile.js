const { src, dest, watch, series, parallel } = require('gulp');
const ejs = require('gulp-ejs');
const htmlmin = require('gulp-htmlmin')
const beautify = require('gulp-jsbeautifier');
const rename = require('gulp-rename');
const replace = require('gulp-replace');

const sass = require('gulp-dart-sass');
const postcss = require('gulp-postcss');
const cssdeclsort = require('css-declaration-sorter');
const sassGlob = require('gulp-sass-glob');
const autoprefixer = require('autoprefixer');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const gcmq = require('gulp-group-css-media-queries');

const imagemin = require("gulp-imagemin");
const pngquant = require("imagemin-pngquant");

const fs = require( 'fs' );
const del = require('del');

const browserSync = require('browser-sync');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const webpackConfig = require('./webpack.config');

const isProd = process.env.BUILD_MODE === 'production';


// -----------------------------------------------------------
// PATH

const srcBase = './src';
const distBase = './dist';
 
const srcPath = {
  'scss': `${srcBase}/assets/stylesheets/**/*.scss`,
  'img': `${srcBase}/assets/images/**/*.{png,jpg,jpeg,gif,svg}`,
  'js': `${srcBase}/assets/javascripts/**/*.ts`,
  'json': `${srcBase}/**/*.json`,
  'ejs': `${srcBase}/**/*.ejs`,
  '_ejs': `!${srcBase}/ejs/**/*`,
 
};
const distPath = {
  'css': `${distBase}/assets/css`,
  'html': `${distBase}/**/*.html`,
  'img': `${distBase}/assets/image`,
  'js': `${distBase}/assets/js`,
  'item': `${distBase}/item`,
};


// -----------------------------------------------------------
// HTML

const htmlminOption = {
  collapseWhitespace: true,
  conservativeCollapse: false,
  minifyCSS: true,
  minifyJS: false,
  removeComments: false
}

const beautifyOption = {
  indent_size: 2,
  max_preserve_newlines: 0,
  html: {
    // indent_inner_html: true,
    indent_scripts: 'keep',
    unformatted: ['script']
  }
}

const Ejs = () => {
  const json = JSON.parse(fs.readFileSync(`${srcBase}/ejs/meta.json`,"utf-8"));
  return src([srcPath.ejs, srcPath._ejs])
    .pipe(plumber({errorHandler:notify.onError('Error: <%= error.message %>')}))
    .pipe(ejs({setting:json}))
    .pipe(rename({ extname: '.html' }))
    .pipe(replace(/[\s\S]*?(<!DOCTYPE)/, '$1'))
    .pipe(dest(`${distBase}/`));
};

const Htmlmin = () => {
  return src(distPath.html)
    .pipe(htmlmin(htmlminOption))
    .pipe(beautify(beautifyOption))
    .pipe(dest(`${distBase}/`));
}


// -----------------------------------------------------------
// SCSS

const outputStyle = {
  compressed: 'compressed',
  expanded: 'expanded',
  nested: 'nested',
  compact: 'compact'
}

const sassOption = {
  outputStyle: isProd ? outputStyle.compressed : outputStyle.expanded,
  sourceMap: true,
  sourceComments: !isProd
}

const sortOption = {
  alphobetically: 'alphobetically',
  smacss: 'smacss',
  concentric: 'concentric-css'
}

const postcssPlugins = [
  autoprefixer({
    grid: true,
    cascade: false
  }),
  cssdeclsort({order: sortOption.smacss})
];

const Sass = () => {
  return src(srcPath.scss)
    .pipe(plumber({ errorHandler: notify.onError('Error: <%= error.message %>') }))
    .pipe(sassGlob())
    .pipe(sass(sassOption))
    .pipe(postcss(postcssPlugins))
    .pipe(dest(distPath.css))
    .pipe(browserSync.stream())
};


// -----------------------------------------------------------
// IMAGE

const Imagemin = () => {
  return src(srcPath.img)
  .pipe(
    imagemin([
      imagemin.mozjpeg({ quality: 80 }),
      imagemin.svgo({
        plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
      }),
      imagemin.gifsicle({
        interlaced: true,
      }),
      pngquant({
        quality: [0.65, 0.8],
        speed: 1,
      }),
    ])
  )
  .pipe(dest(distPath.img))
}


// -----------------------------------------------------------
// browserSync

const buildServer = done => {
  browserSync.init({
    server: {
      baseDir: './dist',
    },
    port: 8080,
  });
  done();
};

const Reload = done => {
  browserSync.reload();
  done();
};

const Stream = done => {
  browserSync.stream();
  done();
}

const WatchFiles = () => {
  watch(srcPath.ejs, series(Ejs, Reload));
  watch(srcPath.scss, series(Sass, Stream));
  watch(srcPath.js, Webpack, Reload);
  watch(srcPath.img, Imagemin);
};


// -----------------------------------------------------------
// clean

const Clean = () => {
  return del(distBase);
}


// -----------------------------------------------------------
// webpack

const Webpack = () => {
  if (isProd) {
    webpackConfig.mode = 'production'
  }
  else {
    webpackConfig.mode = 'development'
    webpackConfig.devtool = 'inline-source-map'
  }
  return webpackStream(webpackConfig, webpack)
  .pipe(plumber({
    errorHandler:notify.onError('Error: <%= error.message %>')
  }))
  .pipe(dest(distPath.js));
};


// -----------------------------------------------------------
// TASK

exports.dev = series(
  parallel(Ejs, Sass, Imagemin, Webpack),
  parallel(buildServer, WatchFiles)
)

exports.build = series(
  Clean,
  parallel(Ejs, Htmlmin, Sass, Webpack)
)

exports.clean = Clean