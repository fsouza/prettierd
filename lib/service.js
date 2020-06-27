const LRU = require("nanolru");
const path = require("path");
const prettier = require("prettier");

const configCache = new LRU(20);

const getParserName = (ext) => {
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
    default:
      return "babel";
  }
};

const withParser = (options, filePath) => {
  return {
    ...options,
    parser: getParserName(path.extname(filePath)),
  };
};

const resolveConfig = (cwd, filePath) => {
  let v = configCache.get(cwd);
  if (!v) {
    v = prettier.resolveConfig.sync(filePath);
    configCache.set(cwd, v);
  }
  return withParser(v, filePath);
};

const resolveFile = (cwd, fileName) => {
  if (path.isAbsolute(fileName)) {
    return [fileName, fileName];
  }
  return [cwd, path.join(cwd, fileName)];
};

exports.invoke = (cwd, args, text, _mtime) => {
  const fileName = args[0];
  const [cacheKey, fullPath] = resolveFile(cwd, fileName);
  const options = resolveConfig(cacheKey, fullPath);
  return prettier.format(text, options);
};
