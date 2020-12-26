const path = require("path");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

const hljs = require("highlight.js");

const highlight = (code, lang) => {
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
};

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

module.exports = (_env, argv) => {
  let cssLoader = "style-loader";
  let optimization = {
    minimize: false,
  };
  if (argv.mode === "production") {
    cssLoader = MiniCssExtractPlugin.loader;
    optimization = {
      minimize: true,
      minimizer: [new TerserPlugin(), new CssMinimizerPlugin()],
    };
  }
  return {
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
      filename: "[name].[contenthash].js",
      path: path.resolve(__dirname, "dist"),
      publicPath: "/",
    },
    module: {
      rules: [
        {
          test: /\.s?css$/,
          use: [cssLoader, "css-loader", "sass-loader"],
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
          use: ["svg-url-loader", "svgo-loader"],
        },
        {
          test: /\.md$/,
          use: [
            "html-loader",
            {
              loader: "markdown-loader",
              options: {
                langPrefix: "hljs language-",
                highlight,
              },
            },
          ],
        },
      ],
    },
    plugins,
    optimization,
  };
};
