const path = require("path");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const svgToMiniDataURI = require("mini-svg-data-uri");

const plugins = [
  new MiniCssExtractPlugin({
    filename: "[name].[contenthash].css",
    chunkFilename: "[id].[contenthash].css",
  }),
  new HtmlWebPackPlugin({
    template: "index.html",
    filename: "index.html",
    chunks: ["index"],
  }),
  new HtmlWebPackPlugin({
    template: "install.html",
    filename: "install/index.html",
    chunks: ["install"],
  }),
];

module.exports = {
  context: path.resolve(__dirname, "src"),
  entry: {
    index: path.resolve(__dirname, "src/index.js"),
    install: path.resolve(__dirname, "src/install.js"),
  },
  output: {
    filename: "[name].[contenthash].js",
    path: path.resolve(__dirname, "dist"),
    publicPath: "/",
  },
  module: {
    rules: [
      {
        test: /\.s?css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
      },
      {
        test: /\.svg$/,
        include: [
          path.resolve(__dirname, "src", "assets"),
          path.resolve(__dirname, "node_modules", "@artichokeruby/logo/img"),
          path.resolve(
            __dirname,
            "node_modules",
            "@artichokeruby/logo/favicons"
          ),
        ],
        type: "asset/resource",
        use: "@hyperbola/svgo-loader",
        generator: {
          filename: "[name][ext]",
        },
      },
      {
        include: [
          path.resolve(__dirname, "src", "assets"),
          path.resolve(__dirname, "node_modules", "@artichokeruby/logo/img"),
          path.resolve(
            __dirname,
            "node_modules",
            "@artichokeruby/logo/favicons"
          ),
        ],
        exclude: /\.svg$/,
        type: "asset/resource",
        generator: {
          filename: "[name][ext]",
        },
      },
      {
        test: /\.(png|jpe?g|gif)$/,
        include: path.resolve(
          __dirname,
          "node_modules",
          "@artichokeruby/logo/optimized"
        ),
        type: "asset",
      },
      {
        test: /\.svg$/,
        exclude: [
          path.resolve(__dirname, "src", "assets"),
          path.resolve(__dirname, "node_modules", "@artichokeruby/logo/img"),
          path.resolve(
            __dirname,
            "node_modules",
            "@artichokeruby/logo/favicons"
          ),
        ],
        type: "asset",
        use: "@hyperbola/svgo-loader",
        generator: {
          dataUrl: (content) => {
            content = content.toString();
            return svgToMiniDataURI(content);
          },
        },
      },
      {
        test: /\.html$/,
        include: path.resolve(__dirname, "src", "partials"),
        use: "html-loader",
      },
      {
        test: /\.md$/,
        use: ["html-loader", path.resolve(__dirname, "loaders/markdown.js")],
      },
    ],
  },
  plugins,
  optimization: {
    minimize: true,
    minimizer: ["...", new CssMinimizerPlugin()],
    chunkIds: "deterministic",
    moduleIds: "deterministic",
    splitChunks: {
      cacheGroups: {
        styles: {
          name: "styles",
          test: /\.css$/,
          chunks: "all",
          enforce: true,
        },
      },
    },
  },
};
