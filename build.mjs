/* eslint-disable no-console */

import { readFileSync } from "node:fs";
import fs from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { renderFile } from "eta";
import esbuild from "esbuild";
import hljs from "highlight.js";
import { marked } from "marked";
import { PurgeCSS } from "purgecss";
import sass from "sass";

// eslint-disable-next-line no-shadow
const require = createRequire(import.meta.url);
const minifyHtml = require("@minify-html/js");

// eslint-disable-next-line no-shadow
const __dirname = fileURLToPath(new URL(".", import.meta.url));

const assets = Object.freeze([
  "src/assets/robots.txt",
  "src/logos/cargo.svg",
  "src/logos/ruby.svg",
  "node_modules/@artichokeruby/logo/favicons/favicon-32x32.png",
  "node_modules/@artichokeruby/logo/favicons/favicon-128x128.png",
  "node_modules/@artichokeruby/logo/favicons/favicon-192x192.png",
  "node_modules/@artichokeruby/logo/favicons/favicon-196x196.png",
  "node_modules/@artichokeruby/logo/favicons/favicon-152x152.png",
  "node_modules/@artichokeruby/logo/favicons/favicon-180x180.png",
  "node_modules/@artichokeruby/logo/favicons/safari-pinned-tab.svg",
  "node_modules/@artichokeruby/logo/favicons/mstile-150x150.png",
  "node_modules/@artichokeruby/logo/favicons/browserconfig.xml",
  "node_modules/@artichokeruby/logo/favicons/site.webmanifest",
  "node_modules/@artichokeruby/logo/optimized/artichoke-logo.png",
  "node_modules/@artichokeruby/logo/optimized/artichoke-logo.svg",
  "node_modules/@artichokeruby/logo/optimized/artichoke-logo-inverted.png",
  "node_modules/@artichokeruby/logo/optimized/artichoke-logo-inverted.svg",
  "node_modules/@artichokeruby/logo/optimized/artichoke-social-logo.png",
  "node_modules/@artichokeruby/logo/optimized/nav-white.svg",
  "node_modules/@artichokeruby/logo/optimized/playground.png",
  "node_modules/@artichokeruby/logo/optimized/playground-social-logo.png",
  "node_modules/@artichokeruby/logo/optimized/wordmark-black.svg",
  "node_modules/@artichokeruby/logo/social/twitter-logo-black.svg",
  "node_modules/@artichokeruby/logo/social/twitter-logo-blue.svg",
  "node_modules/@artichokeruby/logo/social/github-logo.svg",
  "node_modules/@artichokeruby/logo/social/discord-logo.svg",
]);

marked.setOptions({
  renderer: new marked.Renderer(),
  highlight: (code, language) => {
    const highlighted = hljs.highlight(code, {
      language,
      ignoreIllegals: true,
    });
    const html = highlighted.value;
    return html;
  },
  langPrefix: "hljs artichoke-highlight language-",
  pedantic: false,
  gfm: true,
  breaks: false,
  sanitize: false,
  smartLists: true,
  smartypants: false,
  xhtml: false,
});

const includeMarkdown = (source) => {
  const filePath = path.join(__dirname, "src", source);
  const content = readFileSync(filePath);
  return marked(content.toString());
};

const esbuildSassPlugin = {
  name: "sass",
  setup(build) {
    build.onResolve({ filter: /\.scss$/ }, (args) => {
      return {
        path: path.resolve(args.resolveDir, args.path),
        namespace: "sass",
      };
    });
    build.onLoad({ filter: /.*/, namespace: "sass" }, (args) => {
      let compiled = sass.renderSync({
        file: args.path,
        includePaths: [path.join(__dirname, "node_modules")],
      });
      return {
        contents: compiled.css.toString(),
        loader: "css",
      };
    });
  },
};

const renderTemplate = async (template, language) => {
  const localePath = path.join(__dirname, "src", "locales", language + '.json');
  const t = JSON.parse(readFileSync(localePath));
  const prefix = (language == "en") ? "" : ("/" + language)

  let content = await renderFile(
    template,
    {
      language,
      t,
      prefix,
      includeMarkdown
    },
    { views: path.join(__dirname, "src") }
  );

  if (process.argv.includes("--release")) {
    const cfg = minifyHtml.createConfiguration({
      do_not_minify_doctype: true,
      ensure_spec_compliant_unquoted_attribute_values: true,
      keep_closing_tags: true,
      keep_html_and_head_opening_tags: true,
      keep_spaces_between_attributes: true,
      minify_js: true,
      minify_css: true,
      remove_bangs: false,
    });

    content = minifyHtml.minify(content, cfg);
  }

  return content;
};

const build = async () => {
  const locales = ["en", "zh-hans"];

  await fs.mkdir("dist/install", { recursive: true });
  await fs.mkdir("dist/logos", { recursive: true });
  await fs.mkdir("dist/social", { recursive: true });
  await fs.mkdir("dist/zh-hans/install", { recursive: true });
  await fs.mkdir("dist/zh-hans/logos", { recursive: true });
  await fs.mkdir("dist/zh-hans/social", { recursive: true });

  await Promise.all(
    assets.map(async (asset) => {
      const file = path.basename(asset);
      if (asset.includes("/social/")) {
        await fs.copyFile(asset, path.join(__dirname, "dist", "social", file));
      } else if (asset.includes("/logos/")) {
        await fs.copyFile(asset, path.join(__dirname, "dist", "logos", file));
      } else {
        await fs.copyFile(asset, path.join(__dirname, "dist", file));
      }
    })
  );

  await Promise.all(locales.map(async (lang) => {
    let index = await renderTemplate("index.html", lang);
    await fs.writeFile(lang == "en" ?
      path.join(__dirname, "dist", "index.html") :
      path.join(__dirname, "dist", lang, "index.html"), index);

    let install = await renderTemplate("install.html", lang);
    await fs.writeFile(
      lang == "en" ?
        path.join(__dirname, "dist", "install", "index.html") :
        path.join(__dirname, "dist", lang, "install", "index.html"),
      install
    );
  }));

  await esbuild.build({
    entryPoints: {
      main: "./src/index.js",
    },
    entryNames: "[name].bundle",
    bundle: true,
    outdir: "./dist",
    loader: {
      ".rb": "text",
      ".ttf": "file",
    },
    minify: process.argv.includes("--release"),
    plugins: [esbuildSassPlugin],
  });

  const purgeCSSResult = await new PurgeCSS().purge({
    content: ["dist/**/*.html"],
    css: ["dist/**/*.css"],
    safelist: ["show"],
  });
  for (const { file, css } of purgeCSSResult) {
    await fs.writeFile(file, css);
  }
};

(async function main() {
  try {
    await build();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
