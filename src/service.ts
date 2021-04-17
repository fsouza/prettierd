process.env.FORCE_COLOR = "0";

import LRU from "nanolru";
import path from "path";
import prettier from "prettier";
import { Options, format } from "prettier";

const configCache = new LRU({ max: 20, maxAge: 60000 });

async function resolveConfig(cwd: string, filepath: string): Promise<Options> {
  let v = configCache.get<string, Options>(cwd);
  if (!v) {
    v = await prettier.resolveConfig(filepath, {
      editorconfig: true,
      useCache: false,
    });
    if (v) {
      configCache.set(cwd, v);
    }
  }
  return {
    ...v,
    filepath,
  };
}

function resolveFile(cwd: string, fileName: string): [string, string] {
  if (path.isAbsolute(fileName)) {
    return [fileName, fileName];
  }
  return [cwd, path.join(cwd, fileName)];
}

async function run(cwd: string, args: string[], text: string): Promise<string> {
  const fileName = args[0] === "--no-color" ? args[1] : args[0];
  const [cacheKey, fullPath] = resolveFile(cwd, fileName);
  const options = await resolveConfig(cacheKey, fullPath);
  return format(text, options);
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
