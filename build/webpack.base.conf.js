var path = require('path')
var utils = require('./utils')

var projectRoot = path.resolve(__dirname, '../')
const vuxLoader = require('vux-loader')

var config = require('../config')
var vueLoaderConfig = require('./vue-loader.conf')
// var LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin

// var phaserModule = path.join(__dirname, '../node_modules/phaser-ce/')
// var phaser = path.join(phaserModule, 'build/custom/phaser-split.js')
// var pixi = path.join(phaserModule, 'build/custom/pixi.js')
// var p2 = path.join(phaserModule, 'build/custom/p2.js')
require('babel-polyfill')

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

let webpackConfig = {
  entry: {
    polyfill: 'babel-polyfill',
    app: './src/main.js',
    // vendor: ['pixi', 'p2', 'phaser']
  },
  output: {
    path: config.build.assetsRoot,
    filename: '[name].js',
    publicPath:
      process.env.NODE_ENV === 'production'
        ? config.build.assetsPublicPath
        : config.dev.assetsPublicPath
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      vue$: 'vue/dist/vue.js',
      '@': resolve('src'),
      // phaser: phaser,
      // pixi: pixi,
      // p2: p2
    }
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: vueLoaderConfig
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [resolve('src'), resolve('test')],
        query: {
          presets: ['env']
        }
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('images/[name].[hash:7].[ext]'),
          publicPath: '../../'
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('media/[name].[hash:7].[ext]'),
          publicPath: '../../'
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('fonts/[name].[hash:7].[ext]'),
          publicPath: '../../'
        }
      },
      {
        test: /\.scss$/,
        loader: 'style!css!sass'
      },
      // { test: /pixi\.js/, use: ['expose-loader?PIXI'] },
      // { test: /phaser-split\.js$/, use: ['expose-loader?Phaser'] },
      // { test: /p2\.js/, use: ['expose-loader?p2'] }
    ]
  }
}

module.exports = vuxLoader.merge(webpackConfig, {
  plugins: [
    'vux-ui',
    'progress-bar',
    'duplicate-style',
    'lodash-webpack-plugin',
    new BundleAnalyzerPlugin()
  ]
})
