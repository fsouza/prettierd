import fs from "fs/promises";
import path from "path";

async function getDotfile(title: string): Promise<string> {
  if (process.env.CORE_D_DOTFILE) {
    return process.env.CORE_D_DOTFILE;
  }

  if (process.env.HOME && process.env.XDG_CONFIG_HOME) {
    const confDir = path.join(process.env.XDG_CONFIG_HOME, title);
    await fs.mkdir(confDir, { recursive: true });

    const confPath = path.join(confDir, title);
    return path.relative(process.env.HOME, confPath);
  }

  return ".prettierd";
}

async function main(cmd: string): Promise<void> {
  const title = "prettierd";

  process.env.CORE_D_TITLE = title;
  process.env.CORE_D_SERVICE = require.resolve("./service");
  process.env.CORE_D_DOTFILE = await getDotfile(title);

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

  const fileName = cmd;
  let text = "";
  process.stdin.setEncoding("utf-8");
  process.stdin.on("data", (chunk) => {
    text += chunk;
  });
  process.stdin.on("end", () => {
    core_d.invoke([fileName], text);
  });
}

main(process.argv[2]).catch((err) => {
  console.error(err);
  process.exit(1);
});
