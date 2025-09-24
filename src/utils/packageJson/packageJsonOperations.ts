import { readFileSync, writeFileSync } from "node:fs";
import { join as joinPath } from "node:path";

import type { PackageJson } from "./PackageJsonTypes.js";

/**
 * Reads and parses the package.json file from the current working directory.
 *
 * @returns The parsed package.json object
 */
function read(packageJsonDir: string): PackageJson {
  return JSON.parse(
    readFileSync(joinPath(packageJsonDir, "package.json"), {
      encoding: "utf-8",
    })
  );
}

/**
 * Writes a package.json object to the file system. Uses cwd for the path.
 *
 * @param packageJson - The package.json object to write to disk
 */
function write(packageJsonDir: string, packageJson: PackageJson) {
  writeFileSync(
    joinPath(packageJsonDir, "package.json"),
    JSON.stringify(packageJson, null, 2) + "\n",
    {
      encoding: "utf-8",
    }
  );
}

const packageJson = {
  read,
  write,
};

export default packageJson;
