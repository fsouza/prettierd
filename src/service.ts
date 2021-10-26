process.env.FORCE_COLOR = "0";

import LRU from "nanolru";
import { dirname } from "path";
import path from "path";
import type Prettier from "prettier";
import { promisify } from "util";
import fs from "fs";

const stat = promisify(fs.stat);

const cacheParams = { max: 500, maxAge: 60000 };

const caches = {
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
): Promise<Prettier.Options> {
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

  return { ...config, filepath };
}

async function resolveConfig(
  prettier: typeof Prettier,
  filepath: string
): Promise<Prettier.Options> {
  const cachedValue = caches.configCache.get<string, Prettier.Options>(
    filepath
  );
  if (cachedValue) {
    return cachedValue;
  }

  const config = await resolveConfigNoCache(prettier, filepath);
  caches.configCache.set(filepath, config);
  return config;
}

async function resolvePrettier(
  dir: string
): Promise<typeof Prettier | undefined> {
  const cached = caches.importCache.get<string, typeof Prettier | false>(dir);
  if (cached) {
    return cached;
  }

  if (cached === false) {
    return undefined;
  }

  return import(require.resolve("prettier", { paths: [dir] }))
    .catch(() => {
      if (process.env.PRETTIERD_LOCAL_PRETTIER_ONLY) {
        return undefined;
      }
      return import("prettier");
    })
    .then((v) => {
      caches.importCache.set(dir, v ?? false);
      return v;
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

function parseCLIArguments(args: string[]): [CLIArguments, string] {
  const parsedArguments: CLIArguments = { ...defaultCLIArguments };
  let fileName: string | null = null;

  const argsIterator = args[Symbol.iterator]();
  for (const arg of argsIterator) {
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

      default:
        // NOTE: positional arguments are assumed to be file paths
        if (fileName) {
          throw new Error("Only a single file path is supported");
        }
        fileName = arg;
        break;
    }
  }

  if (!fileName) {
    throw new Error("File name must be provided as an argument");
  }

  return [parsedArguments, fileName];
}

async function run(cwd: string, args: string[], text: string): Promise<string> {
  const [{ ignorePath }, fileName] = parseCLIArguments(args);
  const fullPath = resolveFile(cwd, fileName);
  const prettier = await resolvePrettier(path.dirname(fullPath));
  if (!prettier) {
    return text;
  }

  const { ignored } = await prettier.getFileInfo(fileName, { ignorePath });
  if (ignored) {
    return text;
  }

  const options = await resolveConfig(prettier, fullPath);

  return prettier.format(text, {
    ...options,
    pluginSearchDirs: await pluginSearchDirs(cwd),
  });
}

export function invoke(
  cwd: string,
  args: string[],
  text: string,
  _mtime: number,
  cb: (_err?: string, _resp?: string) => void
): void {
  run(cwd, args, text)
    .then((resp) => void cb(undefined, resp))
    .catch((error) => void cb(error));
}
