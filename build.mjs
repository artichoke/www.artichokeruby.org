/* eslint-disable no-console */

import { Buffer } from "node:buffer";
import { readFileSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";

import minifyHtml from "@minify-html/node";
import { Eta } from "eta";
import esbuild from "esbuild";
import hljs from "highlight.js";
import { marked } from "marked";

const makeLocale = (language, twitter, isDefaultLocale = false) => {
  const urlPrefix = isDefaultLocale ? "/" : `/${language.toLowerCase()}/`;
  const pathPrefix = isDefaultLocale ? "" : `${language.toLowerCase()}`;
  const locale = Object.assign(Object.create(null), {
    language,
    twitter,
    pathPrefix,
    links: Object.assign(Object.create(null), {
      home: urlPrefix,
      install: `${urlPrefix}install/`,
    }),
    default: isDefaultLocale,
    stringsPath: path.join("src", "locales", `${language}.json`),
  });
  return Object.freeze(locale);
};

// Locales in this build script contain the following keys:
//
// - `language`: An IETF BCP 47 language tag See:
//   - https://en.wikipedia.org/wiki/IETF_language_tag
//   - https://www.rfc-editor.org/info/bcp47
// - `twitter`: A language code accepted by the `data-lang` attribute on Twitter
//   embeds.
// - `pathPrefix`: A (possibly empty) directory name where templates should be
//   rendered on disk.
// - `slugToLink`: A function that takes a page slug and returns a link for the
//   current locale.
// - `default`: A Boolean which indicates if the locale is the default locale.
const locales = Object.freeze([
  makeLocale("en", "en", true),
  makeLocale("zh-Hans", "zh-cn"),
]);

const assets = Object.freeze([
  "src/assets/robots.txt",
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
  const filePath = path.resolve("src", source);
  const content = readFileSync(filePath);
  return marked.parse(content.toString());
};

const renderTemplate = async (template, locale) => {
  const t = JSON.parse(await fs.readFile(locale.stringsPath));

  const context = {
    locale,
    locales: Object.fromEntries(
      locales.map((locale) => [locale.language, locale]),
    ),
    defaultLocale: locales.find((locale) => locale.default),
    t,
    includeMarkdown,
  };
  const html = await fs.readFile(path.resolve("src", template), "utf8");

  const eta = new Eta({ views: "src" });
  const content = eta.renderString(html, context);

  const input = Buffer.from(content);
  const output = minifyHtml.minify(input, {
    do_not_minify_doctype: true,
    ensure_spec_compliant_unquoted_attribute_values: true,
    keep_closing_tags: true,
    keep_html_and_head_opening_tags: true,
    keep_spaces_between_attributes: true,
    minify_js: true,
    minify_css: true,
    remove_bangs: false,
  });

  return output.toString();
};

const setupOutdir = async (outdir) => {
  const dirs = [];
  for (let { pathPrefix } of locales) {
    dirs.push(path.join(outdir, pathPrefix));
    dirs.push(path.join(outdir, pathPrefix, "install"));
  }
  const socialAssetDir = path.join(outdir, "social");
  dirs.push(socialAssetDir);
  const logosAssetDir = path.join(outdir, "logos");
  dirs.push(logosAssetDir);
  await Promise.all(dirs.map((dir) => fs.mkdir(dir, { recursive: true })));

  return Object.assign(Object.create(null), {
    socialAssetDir,
    logosAssetDir,
  });
};

const copyAssets = async (outdir, socialAssetDir, logosAssetDir) => {
  await Promise.all(
    assets.map(async (asset) => {
      const file = path.basename(asset);
      if (asset.includes("/social/")) {
        await fs.copyFile(asset, path.join(socialAssetDir, file));
        return;
      }
      if (asset.includes("/logos/")) {
        await fs.copyFile(asset, path.join(logosAssetDir, file));
        return;
      }
      await fs.copyFile(asset, path.join(outdir, file));
    }),
  );
};

const build = async () => {
  const outdir = "dist";
  const { socialAssetDir, logosAssetDir } = await setupOutdir(outdir);
  await copyAssets(outdir, socialAssetDir, logosAssetDir);

  await Promise.all(
    locales.map(async (locale) => {
      let index = await renderTemplate("index.html", locale);
      const indexOut = path.normalize(
        path.join(outdir, locale.pathPrefix, "index.html"),
      );
      await fs.writeFile(indexOut, index);

      let install = await renderTemplate("install.html", locale);
      const installOut = path.normalize(
        path.join(outdir, locale.pathPrefix, "install", "index.html"),
      );
      await fs.writeFile(installOut, install);
    }),
  );

  await esbuild.build({
    entryPoints: {
      main: "./src/index.js",
    },
    entryNames: "[name].bundle",
    bundle: true,
    outdir,
    loader: {
      ".rb": "text",
      ".ttf": "file",
    },
    minify: true,
  });
};

(async function main() {
  try {
    await build();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
