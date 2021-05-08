#!/usr/bin/env node

process.env.CORE_D_TITLE = "prettierd";
process.env.CORE_D_DOTFILE = ".prettierd";
process.env.CORE_D_SERVICE = require.resolve("../dist/service");

const { main } = require("../dist/main");

main(process.argv[2], process.argv[3]);
