const path = require("path");
const glob = require("glob");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const PurgeCSSPlugin = require("purgecss-webpack-plugin");
const svgToMiniDataURI = require("mini-svg-data-uri");

const RemarkHighlight = require("remark-highlight.js");
const RemarkHTML = require("remark-html");

// Taken and modified from tailwindcss at:
// https://github.com/tailwindlabs/tailwindcss/blob/21f7e67c/src/lib/purgeUnusedStyles.js#L25-L34
//
// tailwindcss is MIT licensed: https://github.com/tailwindlabs/tailwindcss/blob/21f7e67c/LICENSE
const tailwindExtractor = (content) => {
  // Capture as liberally as possible, including things like `h-(screen-1.5)`
  const broadMatches = content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || [];
  const broadMatchesWithoutTrailingSlash = broadMatches.map((match) =>
    match.trimEnd("\\")
  );

  // Capture classes within other delimiters like .block(class="w-1/2") in Pug
  const innerMatches =
    content.match(/[^<>"'`\s.(){}[\]#=%]*[^<>"'`\s.(){}[\]#=%:]/g) || [];

  return broadMatches
    .concat(broadMatchesWithoutTrailingSlash)
    .concat(innerMatches);
};

const plugins = [
  new MiniCssExtractPlugin({
    filename: "[name].[contenthash].css",
    chunkFilename: "[id].[contenthash].css",
  }),
  new PurgeCSSPlugin({
    paths: glob.sync(`${path.join(__dirname, "src")}/**/*`, { nodir: true }),
    safelist: ["pre", "hljs", "language-shell", "hljs-meta", "bash", "show"],
    // Taken and modified from tailwindcss at:
    // https://github.com/tailwindlabs/tailwindcss/blob/21f7e67c/src/lib/purgeUnusedStyles.js#L108-117
    //
    // tailwindcss is MIT licensed: https://github.com/tailwindlabs/tailwindcss/blob/21f7e67c/LICENSE
    defaultExtractor: (content) => {
      const extractor = tailwindExtractor;
      const preserved = [...extractor(content)];

      preserved.push(...["pre", "code"]);
      return preserved;
    },
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
  };
  if (argv.mode === "production") {
    cssLoader = MiniCssExtractPlugin.loader;
    optimization.minimize = true;
    optimization.minimizer = ["...", new CssMinimizerPlugin()];
  }
  return {
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
          use: [cssLoader, "css-loader", "sass-loader"],
        },
        {
          test: /\.svg$/,
          include: new RegExp(path.resolve(__dirname, "src", "assets")),
          type: "asset/resource",
          use: "@hyperbola/svgo-loader",
          generator: {
            filename: "[name][ext]",
          },
        },
        {
          include: new RegExp(path.resolve(__dirname, "src", "assets")),
          exclude: /\.svg$/,
          type: "asset/resource",
          generator: {
            filename: "[name][ext]",
          },
        },
        {
          test: /\.(png|jpe?g|gif)$/,
          exclude: new RegExp(path.resolve(__dirname, "src", "assets")),
          type: "asset",
        },
        {
          test: /\.svg$/,
          exclude: new RegExp(path.resolve(__dirname, "src", "assets")),
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
          test: /\.md$/,
          use: [
            "html-loader",
            {
              loader: "remark-loader",
              options: {
                remarkOptions: {
                  plugins: [RemarkHTML, RemarkHighlight],
                },
              },
            },
          ],
        },
      ],
    },
    plugins,
    optimization,
    devServer: {
      compress: true,
      host: "127.0.0.1",
      port: 8080,
    },
  };
};
