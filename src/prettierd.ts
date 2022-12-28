import fs from "fs";
import { promisify } from "util";

// @ts-ignore
import { version } from "../package.json";
import { displayHelp } from "./args";
import { DebugInfo, flushCache, getDebugInfo } from "./service";

const readFile = promisify(fs.readFile);
const validCommands = ["restart", "start", "status", "stop"];

type Action =
  | "PRINT_VERSION"
  | "INVOKE_CORE_D"
  | "PRINT_HELP"
  | "PRINT_DEBUG_INFO"
  | "FLUSH_CACHE";

function processArgs(args: string[]): [Action, string] {
  const flagsToAction: { [flag: string]: Action | undefined } = {
    "--version": "PRINT_VERSION",
    "--help": "PRINT_HELP",
    "flush-cache": "FLUSH_CACHE",
    "--debug-info": "PRINT_DEBUG_INFO",
  };

  for (const arg of args) {
    const action = flagsToAction[arg];
    if (action) {
      return [action, ""];
    }
  }

  return ["INVOKE_CORE_D", args[0]];
}

function printDebugInfo(debugInfo: DebugInfo): void {
  if (debugInfo.resolvedPrettier) {
    console.log(
      `prettier version: ${debugInfo.resolvedPrettier.module.version}
  Loaded from: ${debugInfo.resolvedPrettier.filePath}
  Cache: ${debugInfo.resolvedPrettier.cacheHit ? "hit" : "miss"}\n`
    );
  }

  console.log("Cache information:");
  debugInfo.cacheInfo.forEach((cacheInfo) => {
    console.log(`- "${cacheInfo.name}" contains ${cacheInfo.length} items`);
  });
}

async function main(args: string[]): Promise<void> {
  const [action, cmdOrFilename] = processArgs(args);

  switch (action) {
    case "PRINT_VERSION":
      console.log(`prettierd ${version}\n`);
      return;
    case "PRINT_HELP":
      displayHelp();
      return;
    case "PRINT_DEBUG_INFO":
      console.log(`prettierd ${version}`);
      const debugInfo = await getDebugInfo(process.cwd(), args.slice(1));
      printDebugInfo(debugInfo);
      return;
    case "FLUSH_CACHE":
      flushCache();
      console.log("success");
      return;
  }

  const title = "prettierd";

  process.env.CORE_D_TITLE = title;
  process.env.CORE_D_SERVICE = require.resolve("./service");
  process.env.CORE_D_DOTFILE = `.${title}@${encodeURIComponent(process.cwd())}`;

  const core_d = require("core_d");

  if (validCommands.includes(cmdOrFilename)) {
    core_d[cmdOrFilename]();
    return;
  }

  core_d.invoke(
    {
      args,
      clientEnv: Object.keys(process.env)
        .filter((key) => key.startsWith("PRETTIERD_"))
        .reduce(
          (acc, key) => Object.assign(acc, { [key]: process.env[key] }),
          {}
        ),
    },
    await readFile(process.stdin.fd, { encoding: "utf-8" })
  );
}

main(process.argv.slice(2)).catch((err) => {
  console.error(err);
  process.exit(1);
});
