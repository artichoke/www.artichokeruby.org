# Contributing to Artichoke

👋 Hi and welcome to [Artichoke](https://github.com/artichoke). Thanks for
taking the time to contribute! 💪💎🙌

`www.artichokeruby.org` is the project website for [Artichoke Ruby]. [There is
lots to do].

If the Artichoke does not run Ruby source code in the same way that MRI does, it
is a bug and we would appreciate if you [filed an issue so we can fix it].

If you would like to contribute code 👩‍💻👨‍💻, find an issue that looks interesting
and leave a comment that you're beginning to investigate. If there is no issue,
please file one before beginning to work on a PR.

[artichoke]: https://github.com/artichoke
[artichoke ruby]: https://github.com/artichoke/artichoke
[there is lots to do]: https://github.com/artichoke/artichoke/issues
[filed an issue so we can fix it]:
  https://github.com/artichoke/artichoke/issues/new

## Setup

The Artichoke project website is a static site that includes HTML and JavaScript
sources. Developing the site requires a Node.js toolchain.

### Node.js

The project website uses Node.js for linting, orchestration, and development
tooling.

You will need to install [Node.js].

On macOS, you can install Node.js with [Homebrew]:

```shell
brew install node
```

[node.js]: https://nodejs.org/en/download/package-manager/
[homebrew]: https://docs.brew.sh/Installation

### Node.js Packages

Once you have Node.js installed, you can install the packages specified in
[`package.json`] by running:

```shell
npm install
```

[`package.json`]: package.json
