import fs from "fs";
import { promisify } from "util";

// @ts-ignore
const { version } = require("../package.json");

const readFile = promisify(fs.readFile);
const validCommands = ["restart", "start", "status", "stop"];

type Action = "PRINT_VERSION" | "INVOKE_CORE_D";

function processArgs(args: string[]): [Action, string] {
  if (args.find((arg) => arg === "--version")) {
    return ["PRINT_VERSION", ""];
  }
  return ["INVOKE_CORE_D", args[0]];
}

async function main(args: string[]): Promise<void> {
  const [action, cmdOrFilename] = processArgs(args);

  if (action === "PRINT_VERSION") {
    console.log(`prettierd ${version}`);
    return;
  }

  const title = "prettierd";

  process.env.CORE_D_TITLE = title;
  process.env.CORE_D_SERVICE = require.resolve("./service");
  process.env.CORE_D_DOTFILE = `.${title}`;

  const core_d = require("core_d");

  if (validCommands.includes(cmdOrFilename)) {
    core_d[cmdOrFilename]();
    return;
  }

  core_d.invoke(
    [cmdOrFilename],
    await readFile(process.stdin.fd, { encoding: "utf-8" })
  );
}

main(process.argv.slice(2)).catch((err) => {
  console.error(err);
  process.exit(1);
});
