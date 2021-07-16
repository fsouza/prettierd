import fs from "fs";
import { promisify } from "util";

const readFile = promisify(fs.readFile);

async function main(cmdOrFilename: string): Promise<void> {
  const title = "prettierd";

  process.env.CORE_D_TITLE = title;
  process.env.CORE_D_SERVICE = require.resolve("./service");
  process.env.CORE_D_DOTFILE = `.${title}`;

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
