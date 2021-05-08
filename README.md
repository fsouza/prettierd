# prettierd

[![Build Status](https://github.com/fsouza/prettierd/workflows/Build/badge.svg)](https://github.com/fsouza/prettierd/actions?query=branch:main+workflow:Build)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Using in the command line with node.js](#using-in-the-command-line-with-nodejs)
- [Using with TCP (moar speed)](#using-with-tcp-moar-speed)
- [Supported languages](#supported-languages)
- [Editor integration](#editor-integration)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

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

Checkout [src/service.ts](/src/service.ts) for a list of supported
languages/extensions. Feel free to open a PR if you're missing something.

## Provide Default Configuration

You can provide a default configuration for the prettier via setting the environment variable `PRETTIERD_DEFAULT_CONFIG` to the exact path of the `prettier` configuration file.

## Local Instance

If you have locally installed `prettier` in your package, it will use that. Elsewise it will use the one bundled with the package itself.

## Editor integration

I use this directly with neovim's LSP client, via
[efm-langserver](https://github.com/mattn/efm-langserver):

```lua
local prettier = {
  formatCommand = 'PRETTIERD_DEFAULT_CONFIG=~/.config/nvim/utils/linter-config/.prettierrc.json ' .. 'prettierd ${INPUT}',
  formatStdin = true
}
```

The native TCP client can be used too, I used to do it migrated to
efm-langserver for simplicity, see more details in this [blog
post](https://blog.fsouza.dev/prettierd-neovim-format-on-save/) or my
[configuration](https://github.com/fsouza/dotfiles/blob/2ad8a83bf40a3bc43931cd71b53b171a109f76bc/nvim/lua/fsouza/plugin/prettierd.lua).

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
