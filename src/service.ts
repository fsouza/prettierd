process.env.FORCE_COLOR = "0";

import LRU from "nanolru";
import path from "path";
import prettier from "prettier";
import { BuiltInParserName, Options, format } from "prettier";

const configCache = new LRU({ max: 20, maxAge: 60000 });

const getParserName = (ext: string): BuiltInParserName => {
  switch (ext) {
    case ".tsx":
    case ".ts":
      return "typescript";
    case ".css":
    case ".scss":
      return "css";
    case ".html":
      return "html";
    case ".json":
      return "json";
    case ".yml":
    case ".yaml":
      return "yaml";
    case ".md":
    case ".markdown":
    case ".mkd":
      return "markdown";
    default:
      return "babel";
  }
};

function withParser(options: Options | null, filePath: string): Options {
  return {
    ...options,
    parser: getParserName(path.extname(filePath)),
  };
}

async function resolveConfig(cwd: string, filePath: string): Promise<Options> {
  let v = configCache.get<string, Options>(cwd);
  if (!v) {
    v = await prettier.resolveConfig(filePath, {
      editorconfig: true,
      useCache: false,
    });
    if (v) {
      configCache.set(cwd, v);
    }
  }
  return withParser(v, filePath);
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
  run(cwd, args, text).then((resp) => void cb(undefined, resp));
}
