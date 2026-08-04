/**
 * Webpack configuration.
 *
 * The Firebase configuration is never written into the source code. It is read
 * from a .env file at build time and injected as a single frozen object through
 * DefinePlugin, so the repository stays free of project keys and the bundle
 * never references `process.env` at runtime.
 */

const path = require("node:path");
const webpack = require("webpack");
const dotenv = require("dotenv");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

/**
 * Reads the Firebase configuration from .env, falling back to the real
 * environment so a deploy pipeline can supply the values instead of a file.
 * @returns {Record<string, string>}
 */
function readFirebaseConfig() {
  const fromFile = dotenv.config({ path: path.resolve(__dirname, ".env") }).parsed ?? {};
  const read = (key) => process.env[key] ?? fromFile[key] ?? "";

  return {
    apiKey: read("FIREBASE_API_KEY"),
    authDomain: read("FIREBASE_AUTH_DOMAIN"),
    projectId: read("FIREBASE_PROJECT_ID"),
    storageBucket: read("FIREBASE_STORAGE_BUCKET"),
    messagingSenderId: read("FIREBASE_MESSAGING_SENDER_ID"),
    appId: read("FIREBASE_APP_ID"),
  };
}

module.exports = (environment, argv) => {
  const isProduction = argv.mode === "production";

  return {
    entry: path.resolve(__dirname, "src/index.js"),

    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "js/[name].[contenthash:8].js",
      assetModuleFilename: "assets/[name][ext]",
      // Relative paths keep the build working from a subfolder as well.
      publicPath: "",
      clean: true,
    },

    // Source maps in development only: they must not be published with the
    // production build.
    devtool: isProduction ? false : "source-map",

    module: {
      rules: [
        {
          test: /\.css$/i,
          use: [MiniCssExtractPlugin.loader, "css-loader"],
        },
        {
          test: /\.(?:png|jpe?g|svg|webp)$/i,
          type: "asset/resource",
        },
      ],
    },

    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, "src/index.html"),
        favicon: path.resolve(__dirname, "src/assets/favicon.svg"),
        minify: isProduction,
      }),

      new MiniCssExtractPlugin({
        filename: "css/[name].[contenthash:8].css",
      }),

      new webpack.DefinePlugin({
        // Injected as a literal, so the bundle contains no reference to
        // `process`, which does not exist in a browser.
        __FIREBASE_CONFIG__: JSON.stringify(readFirebaseConfig()),
      }),
    ],

    optimization: {
      splitChunks: {
        // Firebase is large and changes rarely, so it is split into its own
        // chunk that a returning visitor can keep in cache.
        cacheGroups: {
          firebase: {
            test: /[\\/]node_modules[\\/]@?firebase/,
            name: "firebase",
            chunks: "all",
          },
        },
      },
    },

    performance: {
      // The Firebase SDK is around 400 KB on its own and already sits in a
      // separate chunk. The default limit of 244 KB would warn on every build
      // about something that cannot be fixed without dropping Firebase.
      maxAssetSize: 512000,
      maxEntrypointSize: 640000,
    },

    devServer: {
      port: 4004,
      open: false,
      hot: true,
      historyApiFallback: true,
    },
  };
};
