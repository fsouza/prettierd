process.env.FORCE_COLOR = "0";

import LRU from "nanolru";
import { dirname } from "path";
import path from "path";
import type Prettier from "prettier";
import { promisify } from "util";
import fs from "fs";

type CliOptions = {
  [key: string]: boolean | number | string | undefined;
  configPrecedence: "cli-override" | "file-override" | "prefer-file";
};

const stat = promisify(fs.stat);

const cacheParams = { max: 500, maxAge: 60000 };

const caches: { [name: string]: LRU } = {
  configCache: new LRU(cacheParams),
  importCache: new LRU(cacheParams),
  parentCache: new LRU(cacheParams),
};

async function isDir(path: string): Promise<boolean> {
  try {
    const fsStat = await stat(path);
    return fsStat.isDirectory();
  } catch (e) {
    return false;
  }
}

const toCamelcase = (str: string) =>
  str.replace(/-./g, (s) => s[1].toUpperCase());

function argsToOptions(args: string[]) {
  const options: CliOptions = {
    configPrecedence: "cli-override",
  };

  for (const arg of args) {
    let [key, ...valueParts] = arg.replace(/^-+/, "").split("=");
    let value: boolean | number | string = valueParts.join("=");
    if (!value.length) {
      value = !key.startsWith("no-");
      if (!value) {
        key = key.slice(3);
      }
    } else if (/^\d+$/.test(value)) {
      value = Number(value);
    }

    options[toCamelcase(key)] = value;
  }

  return options;
}

async function findParent(
  start: string,
  search: string
): Promise<string | undefined> {
  const cacheKey = `${start}|${search}`;
  const cachedValue = caches.parentCache.get<string, string | false>(cacheKey);

  if (cachedValue === false) {
    return undefined;
  }

  if (cachedValue !== null) {
    return cachedValue;
  }

  const parent = path.join(start, "..");
  if (parent === start) {
    caches.parentCache.set(cacheKey, false);
    return undefined;
  }

  try {
    const candidate = path.join(parent, search);
    if (await isDir(candidate)) {
      caches.parentCache.set(cacheKey, candidate);
      return candidate;
    }
  } catch (e) {}

  return await findParent(parent, search);
}

async function pluginSearchDirs(cwd: string): Promise<string[]> {
  const result: string[] = [];

  const localNodeModules = await findParent(cwd, "node_modules");
  if (localNodeModules) {
    result.push(path.dirname(localNodeModules));
  }

  if (!process.env.PRETTIERD_LOCAL_PRETTIER_ONLY) {
    const parentNodeModules = await findParent(__dirname, "node_modules");
    if (parentNodeModules) {
      result.push(parentNodeModules);
    }
  }

  return result;
}

async function resolveConfigNoCache(
  prettier: typeof Prettier,
  filepath: string
): Promise<Prettier.Options | null> {
  let config = await prettier.resolveConfig(filepath, {
    editorconfig: true,
    useCache: false,
  });

  if (!config && process.env.PRETTIERD_DEFAULT_CONFIG) {
    config = await prettier.resolveConfig(
      dirname(process.env.PRETTIERD_DEFAULT_CONFIG),
      {
        config: process.env.PRETTIERD_DEFAULT_CONFIG,
        editorconfig: true,
        useCache: false,
      }
    );
  }

  return config;
}

async function resolveConfig(
  prettier: typeof Prettier,
  filepath: string
): Promise<Prettier.Options | null> {
  const cachedValue = caches.configCache.get<string, Prettier.Options | null>(
    filepath
  );
  if (cachedValue || cachedValue === null) {
    return cachedValue;
  }

  const config = await resolveConfigNoCache(prettier, filepath);
  caches.configCache.set(filepath, config);
  return config;
}

export type ResolvedPrettier = {
  module: typeof Prettier;
  filePath: string;
  cacheHit: boolean;
};

async function resolvePrettier(
  filePath: string
): Promise<ResolvedPrettier | undefined> {
  const cachedValue = caches.importCache.get<
    string,
    [typeof Prettier, string] | false
  >(filePath);

  if (cachedValue) {
    const [module, filePath] = cachedValue;
    return {
      module,
      filePath,
      cacheHit: true,
    };
  }

  if (cachedValue === false) {
    return undefined;
  }

  let path: string;
  try {
    path = require.resolve("prettier", { paths: [filePath] });
  } catch (e) {
    if (process.env.PRETTIERD_LOCAL_PRETTIER_ONLY) {
      caches.importCache.set(filePath, false);
      return undefined;
    }
    path = require.resolve("prettier");
  }

  return import(path).then((v) => {
    if (v !== undefined) {
      caches.importCache.set(filePath, [v, path]);
      return {
        module: v,
        filePath: path,
        cacheHit: false,
      };
    }
    caches.importCache.set(filePath, false);
    return undefined;
  });
}

function resolveFile(cwd: string, fileName: string): string {
  if (path.isAbsolute(fileName)) {
    return fileName;
  }

  return path.join(cwd, fileName);
}

interface CLIArguments {
  noColor: boolean;
  /** @see https://prettier.io/docs/en/cli.html#--ignore-path */
  ignorePath: string;
}

const defaultCLIArguments: CLIArguments = {
  noColor: false,
  ignorePath: ".prettierignore",
};

function parseCLIArguments(args: string[]): [CLIArguments, string, CliOptions] {
  const parsedArguments: CLIArguments = { ...defaultCLIArguments };
  let fileName: string | null = null;

  const optionArgs: string[] = [];

  const argsIterator = args[Symbol.iterator]();
  for (const arg of argsIterator) {
    if (arg.startsWith("-")) {
      switch (arg) {
        case "--no-color":
          parsedArguments.noColor = true;
          break;

        case "--ignore-path": {
          const nextArg = argsIterator.next();
          if (nextArg.done) {
            throw new Error("--ignore-path option expects a file path");
          }

          parsedArguments.ignorePath = nextArg.value;
          break;
        }
        default: {
          optionArgs.push(arg);
        }
      }
    } else {
      if (fileName) {
        throw new Error("Only a single file path is supported");
      }
      // NOTE: positional arguments are assumed to be file paths
      fileName = arg;
    }
  }

  if (!fileName) {
    throw new Error("File name must be provided as an argument");
  }

  return [parsedArguments, fileName, argsToOptions(optionArgs)];
}

async function run(cwd: string, args: string[], text: string): Promise<string> {
  const [{ ignorePath }, fileName, { configPrecedence, ...cliOptions }] = parseCLIArguments(args);
  const fullPath = resolveFile(cwd, fileName);
  const resolvedPrettier = await resolvePrettier(path.dirname(fullPath));
  if (!resolvedPrettier) {
    return text;
  }

  const { module: prettier } = resolvedPrettier;
  const { ignored } = await prettier.getFileInfo(fileName, { ignorePath });
  if (ignored) {
    return text;
  }

  const fileOptions = await resolveConfig(prettier, fullPath);

  const options: Record<string, unknown> =
    configPrecedence === "cli-override"
      ? { ...fileOptions, ...cliOptions }
      : configPrecedence === "file-override"
      ? { ...cliOptions, ...fileOptions }
      : fileOptions || cliOptions;

  return prettier.format(text, {
    ...options,
    filepath: fullPath,
    pluginSearchDirs: await pluginSearchDirs(cwd),
  });
}

export type CacheInfo = {
  name: string;
  length: number;
  keys: string[];
};

export type DebugInfo = {
  resolvedPrettier?: ResolvedPrettier;
  cacheInfo: CacheInfo[];
};

export async function getDebugInfo(
  cwd: string,
  args: string[]
): Promise<DebugInfo> {
  const [_, fileName] = parseCLIArguments(args);
  const fullPath = resolveFile(cwd, fileName);

  const resolvedPrettier = await resolvePrettier(fullPath);
  const cacheInfo = Object.keys(caches).map((cacheName) => ({
    name: cacheName,
    length: caches[cacheName].length,
    keys: caches[cacheName].keys,
  }));

  return { resolvedPrettier, cacheInfo };
}

export function flushCache(): void {
  for (const cacheName in caches) {
    caches[cacheName].clear();
  }
}

export function invoke(
  cwd: string,
  args: string[],
  text: string,
  cb: (_err?: string, _resp?: string) => void
): void {
  run(cwd, args, text)
    .then((resp) => void cb(undefined, resp))
    .catch((error) => void cb(error));
}
