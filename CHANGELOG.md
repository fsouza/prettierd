# prettierd

## v0.26.1

### Fixed

- Use `TMPDIR` if `XDG_RUNTIME_DIR` is not set

### Updated dependencies

- `@babel/parser` upgraded to `^7.26.5`
- `@typescript-eslint/typescript-estree` upgraded to `^8.19.1`

## v0.26.0

### New features

- Add the ability to lint code with `prettierd --check`

### Updated dependencies

- `prettier` upgraded to `3.4.2`
- `@babel/parser` upgraded to `^7.26.3`
- `@typescript-eslint/typescript-estree` upgraded to `^8.19.0`

## v0.25.4

### Updated dependencies

- `prettier` upgraded to `^3.3.3`
- `@babel/parser` upgraded to `^7.26.2`
- `@typescript-eslint/typescript-estree` upgraded to `^8.14.0`

## v0.25.3

### Fixed

- Fix bugs with stdin encoding on Windows that would cause spurious errors or invalid characters to get inserted

### Updated dependencies

- `prettier` upgraded to `^3.2.5`
- `@babel/parser` upgraded to `^7.24.4`
- `@typescript-eslint/typescript-estree` upgraded to `^7.6.0`

## v0.25.2

### Updated dependencies

- `core_d` upgraded to `^6.1.0`
- `prettier` upgraded to `^3.1.0`
- `@babel/parser` upgraded to `^7.23.5`
- `@typescript-eslint/typescript-estree` upgraded to `^6.6.0`

## v0.25.1

### Updated dependencies

- `core_d` upgraded to `^6.0.0`

## v0.25.0

### Updated dependencies

- `prettier` 3 is now supported! prettier@2 can still be used, though the
  `pluginSearchDirs` option is no longer supported.
- `@babel/parser` upgraded to `^7.22.16`
- `@typescript-eslint/typescript-estree` upgraded to `^6.6.0`

## v0.24.2

### Fixed

- Properly fix `editorconfig` and custom configuration

## v0.24.1

### Fixed

- Fix the default value of `editorconfig`

### Updated dependencies

- `@typescript-eslint/typescript-estree` upgraded to `^6.0.0`

## v0.24.0

### Fixed

- Fix the behavior of `--config-precedence prefer-file`
- Remove caching from the tool. This should fix many bugs caused by
  inconsistencies in the cache. If this causes a big hit to performance, we'll
  reintroduce caches according to their necessity.

### Updated dependencies

- `@babel/parser` upgraded to `^7.22.7`
- `@typescript-eslint/typescript-estree` upgraded to `^5.61.0`

## v0.23.4

### Fixed

- make `prettierd stop` stop all instances of prettierd

### Updated dependencies

- `prettier` upgraded to `^2.8.8`
- `@babel/parser` upgraded to `^7.22.3`
- `@typescript-eslint/typescript-estree` upgraded to `^5.59.7`

## v0.23.3

### Fixed

- fix a bug in argument parsing introduced by a poorly tested refactor

### Updated dependencies

- `prettier` upgraded to `^2.8.4`
- `@babel/parser` upgraded to `^7.21.2`
- `@typescript-eslint/typescript-estree` upgraded to `^5.54.0`

## v0.23.2

### Fixed

- avoid polluting the user home directory with runtime files (move them to
  `$HOME/.prettierd` if XDG_RUNTIME_DIR is not defined)
- fix bug where prettierd would hang if the data dir isn't writable (now it
  displays an error to the user)

## v0.23.1

### Fixed

- fixed how CLI options are combined with the config file (and how priority is
  handled)

## v0.23.0

### New features

- prettierd will now start one daemon per working dir, making sure that it can
  load manually configured plugins

### Updated dependencies

- `@babel/parser` upgraded to `^7.20.7`
- `prettier` upgraded to `^2.8.1`
- `@typescript-eslint/typescript-estree` upgraded to `^5.47.1`

## v0.22.5

### Fixed

- Include parsers for typescript and css to make sure brew formula is more
  usable out of the box

## v0.22.4

### Fixed

- Support casting of bool type arguments to options (thanks @mkdynamic)
- Improve cache handling for config values in the presence of
  `PRETTIERD_LOCAL_PRETTIER_ONLY`

## v0.22.3

### Fixed

- Fix regression in usage of `PRETTIERD_DEFAULT_CONFIG` (regression was
  introduced in 0.22.1).

## v0.22.2

### Fixed

- Properly disable colors in the integration with core_d

## v0.22.1

### New features

- Support injecting environment variables from the client

## v0.22.0

### New features

- Support most of prettier command line options (thanks @MunifTanjim)

### Updated dependencies

- `prettier` upgraded to `^2.7.1`

## v0.21.1

### Fixed

- fix compatibility with core_d 5.0.1

## v0.21.0

### Updated dependencies

- `core_d` upgraded to `^5.0.1`

## v0.20.0

### New features

Added some helper commands flags for debugging/fixing issues.

- `prettierd flush-cache` to flush all caches
- `prettierd --debug-info <file>` to print information about which version of
  prettier will be used for formatting the provided file (and from where it's
  being loaded)

### Updated dependencies

- `prettier` upgraded to `^2.6.2`

## v0.19.2

### Updated dependencies

- `prettier` upgraded to `^2.6.1`

**Note:** this release was also pushed to validate a change in the automatic
release process.

## v0.19.1

### Updated dependencies

- `prettier` upgraded to `^2.6.0`

## v0.19.0

### Updated dependencies

- `core_d` upgraded to `^4.0.0`

## v0.18.1

### Added

- Help menu with `--help` (thanks @joao-vitor-sr)

### Updated dependencies

- `prettier` upgraded to `^2.5.1`

## v0.18.0

> Oct 26, 2021

### Added

- Support for `.prettierignore` files (thanks @Gelio)
- Support for locally-installed plugins (thanks @vatosarmat)

## v0.17.1

> Oct 13, 2021

### Added

- Improved documentation for local setup, covering the setup for users that
  don't have node.js installed (thanks @kunish)

### Changed

- Some minor refactors and improvement to code and typing (thanks @sQVe)

## v0.17.0

> Sep 11, 2021

### Added

- Support for running prettierd exclusively with the local `prettier` package
  (via the environment variable `PRETTIERD_LOCAL_PRETTIER_ONLY`)

### Changed

- Changed how prettierd resolves the local package of `prettier`. Now it'll
  use `dirname(filePath)`, meaning it can detect local installations of prettier
  even when `node_modules` isn't at the root of the repository.

## v0.16.0

> Aug 30, 2021

### Added

- Better support for plugins! `prettierd` will now set the proper parameters
  so prettier can find plugins installed locally/globally

### Updated dependencies

- `prettier` upgraded to `^2.3.2`

### Internal

- Upgrade dev dependencies

## v0.15.0

> Aug 23, 2021

### Added

- Support `--version`, which prints the version of prettierd, but also makes
  it usable with ale.vim.

### Internal

- Upgrade dev dependencies

## v0.14.3

> Jul 16, 2021

### Fixed

- Docs: fix efm example in the editors integration section (thanks @abecodes)
- Fix hang when `CORE_D_DOTFILE` isn't set (thanks @tlvince)

## v0.14.2

> Jul 2, 2021

### Internal

- Upgrade dev dependencies

## v0.14.1

> Jun 23, 2021

### Internal

- Upgrade dev dependencies

## v0.14.0

> May 31, 2021

### Added

- cache the results of `resolvePrettier`, a function that's always called to
  find the correct prettier for a given file (local vs global)

## v0.13.0

> May 23, 2021

### Fixed

- Docs: fix example in the editors integration section

### Removed

- Removed custom parsers (HTML, GraphQL, CSS, SASS and TypeScript): users can
  install them locally if desired

### Updated dependencies

- `core_d` upgraded to `^3.2.0`

## v0.12.4

> May 10, 2021

### Fixed

- Update documentation about supported languages

## v0.12.3

> May 10, 2021

### Internal

- Fix packaging post change to TypeScript

## v0.12.2

> May 10, 2021

### Internal

- Some improvements post change to TypeScript

## v0.12.1

> May 10, 2021

### Internal

- Adopt TypeScript for main module too

## v0.12.0

> May 10, 2021

### Added

- Support for `XDG_CONFIG_HOME` (thanks @sentriz)

## v0.11.1

> May 8, 2021

### Fixed

- Fixes error handling when loading prettier locally

## v0.11.0

> May 8, 2021

### Added

- Support for a global configuration file via the environment variable
  `PRETTIERD_DEFAULT_CONFIG` (thanks @cenk1cenk2)
- Support for local installations of prettier: prettierd will now prefer a
  local installation of prettier when formatting file. This can also be used to
  load additional parsers and plugins (thanks @cenk1cenk2)

## v0.10.1

> Apr 17, 2021

### Fixed

- handle prettier formatting errors (thanks @Gelio)

## v0.10.0

> Apr 16, 2021

### Added

- prettierd now lets prettier figure out the parser, making it possible to
  format file formats unknown to prettierd, as long as prettier can find the
  required plugins (thanks @williamboman)
- ship with support for graphql

### Fixed

- fix getting filename from args: core_d always prepends --no-colors to the
  arg list (thanks @williamboman)

### Updated dependencies

- `@typescript-eslint/typescript-estree` upgraded to `^4.22.0`

## v0.9.3

> Feb 18, 2021

### Fixed

- Improved documentation with examples for editor integration

### Internal

- Moved from `npm` to `yarn`
- Upgrade dev dependencies

## v0.9.2

> Feb 13, 2021

### Fixed

- Fix handling of stdin, allowing prettierd to be used as `prettierd <filename>`. Before this change, users could only use `prettierd` via the TCP
  socket.

## v0.9.1

> Feb 12, 2021

### Internal

- Packaging changes
- Upgrade dev dependencies

## v0.9.0

> Jan 12, 2021

### Added

- prettierd is now async and can handle requests from multiple editors/clients
  more nicely.

### Updated dependencies

- `@typescript-eslint/typescript-estree` upgraded to `^4.13.0`
- `core_d` upgraded to `^3.0.0`

## v0.8.10

> Dec 24, 2020

### Internal

- Upgrade dev dependencies

## v0.8.9

> Dec 1, 2020

### Updated dependencies

- `@typescript-eslint/typescript-estree` upgraded to `^4.9.0`
- `prettier` upgraded to `^2.2.1`

## v0.8.8

> Dec 1, 2020

### Internal

- Upgrade dev dependencies

## v0.8.7

> Oct 30, 2020

### Internal

- Upgrade dev dependencies

## v0.8.6

> Oct 23, 2020

### Fixed

- Forcibly disable colored output: prettierd is designed for being used in
  editors where errors in colored aren't that useful.

## v0.8.5

> Oct 20, 2020

### Updated dependencies

- `remark-parse` upgraded to `^9.0.0`

## v0.8.4

> Oct 8, 2020

### Updated dependencies

- `postscss-scss` upgraded to `^3.0.0`

## v0.8.3

> Sep 13, 2020

### Added

- Support for `editorconfig` in config resolution

### Updated dependencies

- `@typescript-eslint/typescript-estree` upgraded to `^4.0.1`

## v0.8.2

> Aug 23, 2020

### Internal

- Upgrade dev dependencies

## v0.8.1

> Jul 19, 2020

### Fixed

- Fix CI configuration post-migration to npmjs

## v0.8.0

> Jul 19, 2020

### Added

- Support for markdown

### Updated dependencies

- `@typescript-eslint/typescript-estree` upgraded to `^3.6.1`

### Notes

This is the first release available _only_ on npm. prettierd has fully
migrated off the GitHub Package Registry now.

## v0.7.2

> Jul 9, 2020

### Fixed

- Fixed invalid links in the documentation (links broken by the migration to
  TypeScript)

### Updated dependencies

- `@typescript-eslint/typescript-estree` upgraded to `^3.6.0`

### Notes

This is the first release of prettierd available in npm. Previous versions are
only available in the GitHub package registry.

## v0.7.1

> Jun 27, 2020

### Fixed

Fix bug in the repository CI configuration (automatic releases).

## v0.7.0

> Jun 27, 2020

No new features, code-base was migrated to TypeScript.

This also introduced automatic releases to the GitHub package registry.

## v0.6.0

> Jun 27, 2020

### Fixed

- Correctly handle absolte paths
- Fix documentation

## v0.5.0

> Jun 26, 2020

### Added

- Support for YAML
- Support for TSX
- Documentation in the form of a readme :)

## v0.4.0

> Jun 25, 2020

### Added

- Support for JSON

## v0.3.0

> Jun 25, 2020

### Added

- Support for HTML

## v0.2.0

> Jun 23, 2020

### Added

- Support for CSS, SCSS and TypeScript

## v0.1.2

> Jun 23, 2020

### Fixed

Fix the binary in the package distribution

### Notes

This is the first usable release version of `prettierd` as a binary, it was
only published to GitHub package registry.

## v0.1.1

> Jun 23, 2020

Fix package distribution.

## v0.1.0

> Jun 23, 2020

Initial release, basic support for formatting JS and TS files.
