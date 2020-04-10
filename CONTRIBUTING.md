# Contributing to Artichoke

👋 Hi and welcome to [Artichoke](https://github.com/artichoke). Thanks for
taking the time to contribute! 💪💎🙌

`www.artichokeruby.org` is the project website for
[Artichoke Ruby](https://github.com/artichoke/artichoke).
[There is lots to do](https://github.com/artichoke/artichoke/issues).

If the Artichoke does not run Ruby source code in the same way that MRI does, it
is a bug and we would appreciate if you
[filed an issue so we can fix it](https://github.com/artichoke/artichoke/issues/new).

If you would like to contribute code 👩‍💻👨‍💻, find an issue that looks interesting
and leave a comment that you're beginning to investigate. If there is no issue,
please file one before beginning to work on a PR.

## Discussion

If you'd like to engage in a discussion outside of GitHub, you can
[join Artichoke's public Discord server](https://discord.gg/QCe2tp2).

## Setup

The Artichoke project website is a static site that includes HTML and JavaScript
sources. Developing the site requires a Node.js toolchain.

### Node.js

The project website uses Node.js for linting, orchestration, and development
tooling.

You will need to install
[Node.js](https://nodejs.org/en/download/package-manager/).

On macOS, you can install Node.js with
[Homebrew](https://docs.brew.sh/Installation):

```shell
brew install node
```

### Node.js Packages

Once you have Node.js installed, you can install the packages specified in
[`package.json`](/package.json) by running:

```shell
npm install
```
