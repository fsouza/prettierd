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

  const localPath = path.join(cwd, "node_modules");
  if (await isDir(localPath)) {
    result.push(localPath);
  }

  const parentNodeModules = await findParent(__dirname, "node_modules");
  if (parentNodeModules) {
    result.push(parentNodeModules);
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
    console.log(process.env.PRETTIERD_DEFAULT_CONFIG);
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

async function resolvePrettier(dir: string): Promise<typeof Prettier> {
  const cached = caches.importCache.get<string, typeof Prettier>(dir);
  if (cached) {
    return cached;
  }

  return import(require.resolve("prettier", { paths: [dir] }))
    .catch(() => import("prettier"))
    .then((v) => {
      caches.importCache.set(dir, v);
      return v;
    });
}

function resolveFile(cwd: string, fileName: string): [string, string] {
  if (path.isAbsolute(fileName)) {
    return [fileName, fileName];
  }

  return [cwd, path.join(cwd, fileName)];
}

async function run(cwd: string, args: string[], text: string): Promise<string> {
  const fileName = args[0] === "--no-color" ? args[1] : args[0];
  const [, fullPath] = resolveFile(cwd, fileName);
  const prettier = await resolvePrettier(path.dirname(fullPath));
  const options = await resolveConfig(prettier, fullPath);

  return prettier.format(text, {
    ...options,
    // @ts-ignore: pluginSearchDirs is not declared in the prettier interface :(
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
