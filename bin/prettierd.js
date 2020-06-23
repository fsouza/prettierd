#!/usr/bin/env node

const cmd = process.argv[2];

process.env.CORE_D_TITLE = "prettierd";
process.env.CORE_D_DOTFILE = ".prettierd";
process.env.CORE_D_SERVICE = require.resolve("../lib/service");

const core_d = require("core_d");

if (
  cmd === "start" ||
  cmd === "stop" ||
  cmd === "restart" ||
  cmd === "status"
) {
  core_d[cmd]();
  return;
}

const run = (fileName) => {
  let text = "";
  process.stdin.setEncoding("utf-8");
  process.stdin.on("data", (chunk) => {
    text += chunk;
  });
  process.stdin.on("end", () => {
    core_d.invoke([fileName], text);
  });
};

const fileName = process.argv[2];
run(fileName);
