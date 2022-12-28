# prettierd

[![Build Status](https://github.com/fsouza/prettierd/workflows/Build/badge.svg)](https://github.com/fsouza/prettierd/actions?query=branch:main+workflow:Build)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Installation guide](#installation-guide)
- [Using in the command line with node.js](#using-in-the-command-line-with-nodejs)
- [Supported languages / plugins](#supported-languages--plugins)
- [Additional plugins](#additional-plugins)
- [Provide Default Configuration](#provide-default-configuration)
- [Local Instance](#local-instance)
- [Editor integration](#editor-integration)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

Wanna run prettier in your editor, but fast? Welcome to prettierd!

This is built on top of [core_d.js](https://github.com/mantoni/core_d.js) and
integrates with prettier.

## Installation guide

```
$ npm install -g @fsouza/prettierd
```

**NOTE**: `npm` comes builtin to [`node`](https://nodejs.org).

Alternatively, users may also use homebrew:

```
$ brew install fsouza/prettierd/prettierd
```

## Using in the command line with node.js

The prettierd script always takes the file in the standard input and the
positional parameter with the name of the file:

```
$ cat file.ts | prettierd file.ts
```

## Supported languages / plugins

Many parsers ship with prettierd, including JavaScript, TypeScript, GraphQL,
CSS, HTML and YAML.
Please notice that starting with version 0.12.0, prettierd now supports
invoking the local version of prettier, so instead of adding new languages to
prettierd, you should rely on that feature to use it locally with your custom
version of prettier and enabled plugins.

## Additional plugins

Additional plugins can be supported by installing them and adding them to the
prettier configuration. For example, to use the Ruby plugin, install
[`@prettier/plugin-ruby`](https://www.npmjs.com/package/@prettier/plugin-ruby)
and add it to your configuration:

```json
{
  ... other settings
  "plugins": ["@prettier/plugin-ruby"]
}
```

Then formatting Ruby files should be possible.

## Provide Default Configuration

You can provide a default configuration for the prettier via setting the
environment variable `PRETTIERD_DEFAULT_CONFIG` to the exact path of the
`prettier` configuration file.

## Local Instance

If you have locally installed `prettier` in your package, it will use that.
Otherwise, it will use the one bundled with the package itself.

If you want to use prettierd exclusively with the locally installed prettier
package, you can set the environment variable `PRETTIERD_LOCAL_PRETTIER_ONLY`
(any truthy value will do, good examples are `true` or `1`).

## Editor integration

I use this directly with neovim's LSP client, via
[efm-langserver](https://github.com/mattn/efm-langserver):

```lua
local prettier = {
  formatCommand = 'prettierd "${INPUT}"',
  formatStdin = true,
  env = {
    string.format('PRETTIERD_DEFAULT_CONFIG=%s', vim.fn.expand('~/.config/nvim/utils/linter-config/.prettierrc.json')),
  },
}
```

Alternatively, one can use
[prettierme](https://github.com/ruyadorno/prettierme) to integrate directly
with other editors.

Or, as a third option for users of Vim/Neovim plugins such as
[formatter.nvim](https://github.com/mhartington/formatter.nvim) or
[vim-codefmt](https://github.com/google/vim-codefmt), you can configure
prettierd in the stdin mode. Below is an example with `formatter.nvim`:

```lua
require('formatter').setup({
  logging = false,
  filetype = {
    javascript = {
        -- prettierd
       function()
          return {
            exe = "prettierd",
            args = {vim.api.nvim_buf_get_name(0)},
            stdin = true
          }
        end
    },
    -- other formatters ...
  }
})
```

I don't know much about other editors, but feel free to send a pull requests on
instructions.
