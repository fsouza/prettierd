#!/usr/bin/env node

const path = require("path");
const fs = require("fs");

function getDotfile() {
  if (process.env.CORE_D_DOTFILE) {
    return process.env.CORE_D_DOTFILE;
  }

  if (process.env.HOME && process.env.XDG_CONFIG_HOME) {
    const confDir = path.join(
      process.env.XDG_CONFIG_HOME,
      process.env.CORE_D_TITLE
    );
    fs.mkdirSync(confDir, { recursive: true });

    const confPath = path.join(confDir, process.env.CORE_D_TITLE);
    return path.relative(process.env.HOME, confPath);
  }

  return ".prettierd";
}

process.env.CORE_D_TITLE = "prettierd";
process.env.CORE_D_SERVICE = require.resolve("../dist/service");
process.env.CORE_D_DOTFILE = getDotfile();

const { main } = require("../dist/main");

main(process.argv[2], process.argv[3]);
