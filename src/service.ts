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

const withParser = (options: Options | null, filePath: string): Options => {
  return {
    ...options,
    parser: getParserName(path.extname(filePath)),
  };
};

const resolveConfig = (cwd: string, filePath: string): Options => {
  let v = configCache.get<string, Options>(cwd);
  if (!v) {
    v = prettier.resolveConfig.sync(filePath, {
      editorconfig: true,
      useCache: false,
    });
    if (v) {
      configCache.set(cwd, v);
    }
  }
  return withParser(v, filePath);
};

const resolveFile = (cwd: string, fileName: string): [string, string] => {
  if (path.isAbsolute(fileName)) {
    return [fileName, fileName];
  }
  return [cwd, path.join(cwd, fileName)];
};

export function invoke(
  cwd: string,
  args: string[],
  text: string,
  _mtime: number,
  cb: (_err?: string, _resp?: string) => void
): void {
  const fileName = args[0];
  const [cacheKey, fullPath] = resolveFile(cwd, fileName);
  const options = resolveConfig(cacheKey, fullPath);
  cb(undefined, format(text, options));
}
