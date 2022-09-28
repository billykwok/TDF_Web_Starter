import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import DuplicatedCheckerPlugin from 'duplicate-package-checker-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import WorkboxPlugin from 'workbox-webpack-plugin';
import path from 'path';

module.exports = (env: { production: boolean }) => ({
  mode: env.production ? 'production' : 'development',
  devtool: env.production ? 'source-map' : 'eval',
  devServer: {
    host: '0.0.0.0',
    port: 8080,
    static: './build',
    compress: true,
    allowedHosts: 'all',
  },
  target: 'web',
  entry: './frontend/index.tsx',
  output: {
    filename: '[name].js',
    chunkFilename: '[name].js',
    path: path.join(__dirname, 'build'),
    publicPath: '/',
    clean: true,
  },
  resolve: { extensions: ['.tsx', '.jsx', '.ts', '.js', '.json'] },
  optimization: {
    emitOnErrors: false,
    moduleIds: 'deterministic',
    minimize: true,
    minimizer: env.production
      ? [
          new TerserPlugin({
            extractComments: true,
            parallel: true,
            terserOptions: {
              mangle: true,
              ecma: 2017,
              safari10: true,
              compress: { hoist_funs: true, passes: 2 },
            },
          }),
          new CssMinimizerPlugin(),
        ]
      : [],
  },
  stats: { colors: true },
  performance: { hints: env.production ? 'warning' : false },
  module: {
    rules: [
      {
        test: /\.css$/i,
        include: [
          path.join(__dirname, 'frontend'),
          path.join(__dirname, 'node_modules'),
        ],
        use: [
          { loader: MiniCssExtractPlugin.loader, options: { esModule: true } },
          {
            loader: 'css-loader',
            options: { sourceMap: false, importLoaders: 1 },
          },
        ],
      },
      {
        test: /\.tsx?$/i,
        exclude: /node_modules/,
        use: [
          { loader: 'babel-loader', options: { cacheDirectory: true } },
          {
            loader: '@linaria/webpack-loader',
            options: {
              sourceMap: false,
              cacheDirectory: path.join(
                __dirname,
                'node_modules/.cache/linaria'
              ),
            },
          },
        ],
      },
    ],
  },
  plugins: (env.production
    ? [new WorkboxPlugin.GenerateSW({ inlineWorkboxRuntime: true })]
    : [new DuplicatedCheckerPlugin()]
  ).concat(
    new MiniCssExtractPlugin({
      filename: env.production ? '[name].[contenthash:8].css' : '[name].css',
      chunkFilename: env.production ? '[id].[contenthash:8].css' : '[id].css',
      ignoreOrder: true,
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      templateContent:
        '<html><head><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"></head><body><div id="root"></div><div id="container"><div id="prev"></div><div id="fullscreen"></div><div id="next"></div></div></body></html>',
    })
  ),
});
