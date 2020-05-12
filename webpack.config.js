const path = require("path");
const CnameWebpackPlugin = require("cname-webpack-plugin");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

const hljs = require("highlight.js");

const plugins = [
  new MiniCssExtractPlugin({
    filename: "[contenthash].css",
  }),
  new HtmlWebPackPlugin({
    template: "index.html",
    filename: "index.html",
    chunks: ["index"],
    minify: {
      collapseWhitespace: true,
      minifyCSS: true,
      minifyJS: true,
      removeComments: true,
      useShortDoctype: true,
    },
  }),
  new HtmlWebPackPlugin({
    template: "install.html",
    filename: "install/index.html",
    chunks: ["install"],
    minify: {
      collapseWhitespace: true,
      minifyCSS: true,
      minifyJS: true,
      removeComments: true,
      useShortDoctype: true,
    },
  }),
  new CnameWebpackPlugin({
    domain: "www.artichokeruby.org",
  }),
];

module.exports = {
  context: path.resolve(__dirname, "src"),
  resolve: {
    alias: {
      assets: path.resolve(__dirname, "assets"),
    },
  },
  entry: {
    index: path.resolve(__dirname, "src/index.js"),
    install: path.resolve(__dirname, "src/install.js"),
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    publicPath: "/",
  },
  plugins,
  module: {
    rules: [
      {
        test: /\.s?css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
      },
      {
        test: new RegExp(path.resolve(__dirname, "assets")),
        use: {
          loader: "file-loader",
          options: {
            name: "[name].[ext]",
          },
        },
      },
      {
        test: /\.(png|jpe?g|gif)$/,
        exclude: new RegExp(path.resolve(__dirname, "assets")),
        use: {
          loader: "url-loader",
          options: {
            limit: 8192,
          },
        },
      },
      {
        test: /\.svg$/,
        exclude: new RegExp(path.resolve(__dirname, "assets")),
        use: ["file-loader", "svgo-loader"],
      },
      {
        test: /\.md$/,
        use: [
          "html-loader",
          {
            loader: "markdown-loader",
            options: {
              langPrefix: "hljs language-",
              highlight: (code, lang) => {
                switch (lang) {
                  case null:
                  case "text":
                  case "literal":
                  case "nohighlight": {
                    return `<pre class="hljs">${code}</pre>`;
                  }
                  default: {
                    const html = hljs.highlight(lang, code).value;
                    return `<span class="hljs">${html}</span>`;
                  }
                }
              },
            },
          },
        ],
      },
    ],
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin(), new OptimizeCSSAssetsPlugin()],
  },
};
