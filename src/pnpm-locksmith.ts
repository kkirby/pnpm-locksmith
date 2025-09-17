#!/usr/bin/env node
import packageJson from "./utils/packageJson/packageJsonOperations.js";
import pnpm from "./utils/pnpm/pnpmOperations.js";
import { syncWithPnpm, syncWithWhy } from "./utils/utils.js";

const pnpmMainProject = pnpm.ls()[0];
const packageJsonContents = packageJson.read();

if (
  packageJsonContents.dependencies != null &&
  pnpmMainProject.dependencies != null
) {
  packageJsonContents.dependencies = syncWithPnpm(
    packageJsonContents.dependencies,
    pnpmMainProject.dependencies
  );
}
if (
  packageJsonContents.devDependencies != null &&
  pnpmMainProject.devDependencies != null
) {
  packageJsonContents.devDependencies = syncWithPnpm(
    packageJsonContents.devDependencies,
    pnpmMainProject.devDependencies
  );
}

if (packageJsonContents.resolutions != null) {
  packageJsonContents.resolutions = syncWithWhy(
    packageJsonContents.resolutions
  );
}

if (packageJsonContents.pnpm?.overrides != null) {
  packageJsonContents.pnpm.overrides = syncWithWhy(
    packageJsonContents.pnpm.overrides
  );
}

packageJson.write(packageJsonContents);

console.log("Synchronized package.json dependencies with pnpm lockfile");
