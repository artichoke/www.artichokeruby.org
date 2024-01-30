# Artichoke project website

[![GitHub Actions](https://github.com/artichoke/www.artichokeruby.org/workflows/CI/badge.svg)](https://github.com/artichoke/www.artichokeruby.org/actions)
[![Discord](https://img.shields.io/discord/607683947496734760)](https://discord.gg/QCe2tp2)
[![Twitter](https://img.shields.io/twitter/follow/artichokeruby?label=Follow&style=social)](https://twitter.com/artichokeruby)

Infrastructure for <https://www.artichokeruby.org>, the project website for
Artichoke Ruby.

## Usage

To launch a local development server:

```sh
npm run dev
```

## Deployment

[www.artichokeruby.org] is currently hosted on GitHub Pages. The `trunk` branch
is automatically deployed to [www.artichokeruby.org] when PRs get merged by a
[GitHub Actions workflow][deploy-workflow].

[www.artichokeruby.org]: https://www.artichokeruby.org/
[deploy-workflow]: .github/workflows/ci.yaml

## Localization

[www.artichokeruby.org] has several localizations and accepts PRs to add
additional localizations:

- `en`: <https://www.artichokeruby.org/>
- `zh-Hans`: <https://www.artichokeruby.org/zh-hans/>
