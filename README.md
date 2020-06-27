# prettierd

[![Build Status](https://github.com/fsouza/prettierd/workflows/Build/badge.svg)](https://github.com/fsouza/prettierd/actions?query=branch:main+workflow:Build)

Wanna run prettier in your editor, but fast? Welcome to prettierd!

This is built on top of [core_d.js](https://github.com/mantoni/core_d.js) and
integrates with prettier.

## Using in the command line with node.js

The prettierd script always takes the file in the standard input and the
positional parameter with the name of the file:

```
$ cat file.ts | prettierd file.ts
```

## Using with TCP (moar speed)

Following the instructions from https://github.com/mantoni/core_d.js#moar-speed:

```
$ PORT=`cat ~/.prettierd | cut -d" " -f1`
$ TOKEN=`cat ~/.prettierd | cut -d" " -f2`
$ echo "$TOKEN $PWD file.ts" | cat - file.ts | nc localhost $PORT
```

## Supported languages

Checkout [lib/service.js](/lib/service.js) for a list of supported
languages/extensions. Feel free to open a PR if you're missing something.
