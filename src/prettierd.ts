import fs from "fs";
import path from "path";

const core_dTitle = "prettierd";

function getDotfile(): string {
  if (process.env.CORE_D_DOTFILE) {
    return process.env.CORE_D_DOTFILE;
  }

  if (process.env.HOME && process.env.XDG_CONFIG_HOME) {
    const confDir = path.join(process.env.XDG_CONFIG_HOME, core_dTitle);
    fs.mkdirSync(confDir, { recursive: true });

    const confPath = path.join(confDir, core_dTitle);
    return path.relative(process.env.HOME, confPath);
  }

  return ".prettierd";
}

process.env.CORE_D_TITLE = core_dTitle;
process.env.CORE_D_SERVICE = require.resolve("../dist/service");
process.env.CORE_D_DOTFILE = getDotfile();

import { main } from "./main";

main(process.argv[2]);
