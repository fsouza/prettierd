#!/usr/bin/env node

const path = require("path");
const fs = require("fs");

process.env.CORE_D_TITLE = "prettierd";
process.env.CORE_D_DOTFILE = ".prettierd";
process.env.CORE_D_SERVICE = require.resolve("../dist/service");

if (process.env.HOME && process.env.XDG_CONFIG_HOME) {
  const confDir = path.join(
    process.env.XDG_CONFIG_HOME,
    process.env.CORE_D_TITLE
  );
  fs.mkdirSync(confDir, { recursive: true });

  const confPath = path.join(confDir, process.env.CORE_D_TITLE);
  process.env.CORE_D_DOTFILE = path.relative(process.env.HOME, confPath);
}

const { main } = require("../dist/main");

main(process.argv[2], process.argv[3]);
