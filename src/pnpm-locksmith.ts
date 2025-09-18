#!/usr/bin/env node
import packageJson from "./utils/packageJson/packageJsonOperations.js";
import pnpm from "./utils/pnpm/pnpmOperations.js";
import { syncWithPnpm, syncWithWhy } from "./utils/utils.js";

// Get the main project from pnpm lockfile (first project in the list)
const pnpmMainProject = pnpm.ls()[0];

// Read the current package.json file
const packageJsonContents = packageJson.read();

// Sync production dependencies if both package.json and pnpm have them
if (
  packageJsonContents.dependencies != null &&
  pnpmMainProject.dependencies != null
) {
  packageJsonContents.dependencies = syncWithPnpm(
    packageJsonContents.dependencies,
    pnpmMainProject.dependencies
  );
}

// Sync development dependencies if both package.json and pnpm have them
if (
  packageJsonContents.devDependencies != null &&
  pnpmMainProject.devDependencies != null
) {
  packageJsonContents.devDependencies = syncWithPnpm(
    packageJsonContents.devDependencies,
    pnpmMainProject.devDependencies
  );
}

// Sync yarn resolutions using pnpm why to find actual installed versions
if (packageJsonContents.resolutions != null) {
  packageJsonContents.resolutions = syncWithWhy(
    packageJsonContents.resolutions
  );
}

// Sync pnpm overrides using pnpm why to find actual installed versions
if (packageJsonContents.pnpm?.overrides != null) {
  packageJsonContents.pnpm.overrides = syncWithWhy(
    packageJsonContents.pnpm.overrides
  );
}

// Write the updated package.json back to disk
packageJson.write(packageJsonContents);

console.log("Synchronized package.json dependencies with pnpm lockfile");
