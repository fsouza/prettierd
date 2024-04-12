import { access, mkdir } from "node:fs/promises";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// @ts-ignore
import { version } from "../package.json";
import { displayHelp } from "./args";
import { DebugInfo, getDebugInfo, stopAll } from "./service";
import getStdin from "./get-stdin";

const coredCommands = ["restart", "start", "status"];

type Action =
  | "PRINT_VERSION"
  | "INVOKE_CORE_D"
  | "PRINT_HELP"
  | "PRINT_DEBUG_INFO"
  | "STOP";

function processArgs(args: string[]): [Action, string] {
  const flagsToAction: { [flag: string]: Action | undefined } = {
    "--version": "PRINT_VERSION",
    "--help": "PRINT_HELP",
    "--debug-info": "PRINT_DEBUG_INFO",
    stop: "STOP",
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
  Loaded from: ${debugInfo.resolvedPrettier.filePath}\n`,
    );
  }
}

function getRuntimeDir(): string {
  const baseDir = process.env.XDG_RUNTIME_DIR ?? os.homedir();
  const basename = path.basename(baseDir);

  return basename === "prettierd" || basename === ".prettierd"
    ? baseDir
    : path.join(baseDir, ".prettierd");
}

async function verifyRuntimeDir(dir: string): Promise<void> {
  try {
    await mkdir(dir, { recursive: true });
    await access(dir, fs.constants.W_OK);
  } catch (e) {
    throw new Error(
      `failed to start prettierd, make sure ${dir} is writable ${e}`,
    );
  }
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
  }

  const title = "prettierd";
  const runtimeDir = getRuntimeDir();
  await verifyRuntimeDir(runtimeDir);
  process.env.XDG_RUNTIME_DIR = runtimeDir;

  process.env.CORE_D_TITLE = title;
  process.env.CORE_D_SERVICE = require.resolve("./service");
  process.env.CORE_D_DOTFILE = `.${title}@${encodeURIComponent(process.cwd())}`;

  if (action === "STOP") {
    await stopAll(runtimeDir, `.${title}`);
    return;
  }

  const core_d = require("core_d");

  if (coredCommands.includes(cmdOrFilename)) {
    core_d[cmdOrFilename]();
    return;
  }

  if (cmdOrFilename === "stop-local") {
    core_d.stop();
    return;
  }

  core_d.invoke(
    {
      args,
      clientEnv: Object.keys(process.env)
        .filter((key) => key.startsWith("PRETTIERD_"))
        .reduce(
          (acc, key) => Object.assign(acc, { [key]: process.env[key] }),
          {},
        ),
    },
    await getStdin(),
  );
}

main(process.argv.slice(2)).catch((err) => {
  console.error(err);
  process.exit(1);
});
