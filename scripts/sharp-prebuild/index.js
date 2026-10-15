const fs = require("fs");
const path = require("path");

// Loaded via NODE_OPTIONS during install. sharp's install script exits 1
// and compiles from source when pkg-config finds a global libvips, or when
// build-from-source is set. The matching @img/sharp-* package is enough.
const names = [`sharp-${process.platform}-${process.arch}`];
if (process.platform === "linux") {
  names.push(`sharp-linuxmusl-${process.arch}`);
}

function prebuildInstalled() {
  let dir = process.cwd();
  for (;;) {
    for (const name of names) {
      const manifest = path.join(dir, "node_modules", "@img", name, "package.json");
      if (fs.existsSync(manifest)) return true;
    }
    const parent = path.dirname(dir);
    if (parent === dir) return false;
    dir = parent;
  }
}

if (prebuildInstalled()) {
  process.env.SHARP_IGNORE_GLOBAL_LIBVIPS = "1";
  delete process.env.npm_config_build_from_source;
}
