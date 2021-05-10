import fs from "fs";
import path from "path";
import { promisify } from "util";

const mkdir = promisify(fs.mkdir);
const readFile = promisify(fs.readFile);

async function getDotfile(title: string): Promise<string> {
  if (process.env.CORE_D_DOTFILE) {
    return process.env.CORE_D_DOTFILE;
  }

  if (process.env.HOME && process.env.XDG_CONFIG_HOME) {
    const confDir = path.join(process.env.XDG_CONFIG_HOME, title);
    await mkdir(confDir, { recursive: true });

    const confPath = path.join(confDir, title);
    return path.relative(process.env.HOME, confPath);
  }

  return ".prettierd";
}

async function main(cmdOrFilename: string): Promise<void> {
  const title = "prettierd";

  process.env.CORE_D_TITLE = title;
  process.env.CORE_D_SERVICE = require.resolve("./service");
  process.env.CORE_D_DOTFILE = await getDotfile(title);

  const core_d = require("core_d");

  if (
    cmdOrFilename === "start" ||
    cmdOrFilename === "stop" ||
    cmdOrFilename === "restart" ||
    cmdOrFilename === "status"
  ) {
    core_d[cmdOrFilename]();
    return;
  }

  core_d.invoke(
    [cmdOrFilename],
    await readFile(process.stdin.fd, { encoding: "utf-8" })
  );
}

main(process.argv[2]).catch((err) => {
  console.error(err);
  process.exit(1);
});
