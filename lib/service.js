const LRU = require("nanolru");
const path = require("path");
const prettier = require("prettier");

const configCache = new LRU(20);

const resolveConfig = (cwd, filePath) => {
  let v = configCache.get(cwd);
  if (!v) {
    v = prettier.resolveConfig.sync(filePath);
    configCache.set(cwd, v);
  }
  return v;
};

exports.invoke = (cwd, args, text, _mtime) => {
  const fileName = args[0];
  if (path.isAbsolute(fileName)) {
    throw new Error("needs a relative path");
  }

  const fullPath = path.join(cwd, fileName);
  const options = resolveConfig(cwd, fullPath);
  return prettier.format(text, options);
};
