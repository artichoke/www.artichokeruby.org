/* eslint-disable no-console */

import { Buffer } from "node:buffer";
import { readFileSync } from "node:fs";
import fs from "node:fs/promises";
import https from "node:https";
import path from "node:path";
import { fileURLToPath } from "node:url";

import minifyHtml from "@minify-html/node";
import { renderFile } from "eta";
import esbuild from "esbuild";
import hljs from "highlight.js";
import { marked } from "marked";
import { PurgeCSS } from "purgecss";

// eslint-disable-next-line no-shadow
const __dirname = fileURLToPath(new URL(".", import.meta.url));

const loadJsonFromUrl = async (url) => {
  const options = {
    headers: { "User-Agent": "Mozilla/5.0" },
  };
  // return new pending promise
  return new Promise((resolve, reject) => {
    // select http or https module, depending on reqested url
    const request = https.get(url, options, (response) => {
      // handle http errors
      if (response.statusCode < 200 || response.statusCode > 299) {
        reject(
          new Error("Failed to load page, status code: " + response.statusCode)
        );
      }
      // temporary data holder
      const body = [];
      // on every content chunk, push it to the data array
      response.on("data", (chunk) => body.push(chunk));
      // we are done, resolve promise with those joined chunks
      response.on("end", () => resolve(body.join("")));
    });
    // handle connection errors of the request
    request.on("error", (err) => reject(err));
  }).then((body) => JSON.parse(body));
};

const getCrates = async () => {
  const artichokeTree = await loadJsonFromUrl(
    "https://api.github.com/repos/artichoke/artichoke/git/trees/trunk"
  );
  const dirs = artichokeTree.tree.filter((item) => item.type === "tree");

  const rustCrates = (
    await loadJsonFromUrl("https://api.github.com/orgs/artichoke/repos")
  )
    .filter((repo) => repo.topics.includes("rust-crate"))
    .filter((repo) => !repo.topics.includes("fork"))
    .filter((repo) => repo.name !== "artichoke")
    .map((repo) => {
      return { name: repo.name, docs: repo.homepage };
    });
  rustCrates.sort((a, b) => a.name.localeCompare(b.name));

  const makeDocEntry = (item) => {
    const crateName = item.path.replaceAll("-", "_");
    return {
      name: item.path,
      docs: `https://artichoke.github.io/artichoke/${crateName}`,
    };
  };

  return [
    {
      section: "artichoke",
      crates: [makeDocEntry({ path: "artichoke" })],
      hasNext: true,
    },
    {
      section: "core",
      crates: dirs
        .filter((item) => item.path.startsWith("artichoke"))
        .map(makeDocEntry),
      hasNext: true,
    },
    {
      section: "spinoso",
      crates: dirs
        .filter((item) => item.path.startsWith("spinoso"))
        .map(makeDocEntry),
      hasNext: true,
    },
    {
      section: "scolapasta",
      crates: dirs
        .filter((item) => item.path.startsWith("scolapasta"))
        .map(makeDocEntry),
      hasNext: true,
    },
    {
      section: "mezzaluna",
      crates: dirs
        .filter((item) => item.path.startsWith("mezzaluna"))
        .map(makeDocEntry),
      hasNext: true,
    },
    {
      section: "first party external",
      crates: rustCrates,
      hasNext: false,
    },
  ];
};

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
    stringsPath: path.join(__dirname, "src", "locales", `${language}.json`),
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

const renderTemplate = async (template, locale, crates) => {
  const t = JSON.parse(await fs.readFile(locale.stringsPath));

  const context = {
    locale,
    locales: Object.fromEntries(
      locales.map((locale) => [locale.language, locale])
    ),
    defaultLocale: locales.find((locale) => locale.default),
    t,
    includeMarkdown,
    crates,
  };
  let content = await renderFile(template, context, {
    views: path.join(__dirname, "src"),
  });

  if (process.argv.includes("--release")) {
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

    content = output.toString();
  }

  return content;
};

const build = async () => {
  const crates = await getCrates();

  await Promise.all(
    locales.map(async (locale) => {
      await fs.mkdir(
        path.normalize(path.join("dist", locale.pathPrefix, "install")),
        { recursive: true }
      );
    })
  );
  await fs.mkdir(path.join("dist", "logos"), { recursive: true });
  await fs.mkdir(path.join("dist", "social"), { recursive: true });

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

  await Promise.all(
    locales.map(async (locale) => {
      let index = await renderTemplate("index.html", locale, crates);
      const indexOut = path.normalize(
        path.join(__dirname, "dist", locale.pathPrefix, "index.html")
      );
      await fs.writeFile(indexOut, index);

      let install = await renderTemplate("install.html", locale, crates);
      const installOut = path.normalize(
        path.join(__dirname, "dist", locale.pathPrefix, "install", "index.html")
      );
      await fs.writeFile(installOut, install);
    })
  );

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
