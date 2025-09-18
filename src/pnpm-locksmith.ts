#!/usr/bin/env node
import {
  type ProjectId,
  readWantedLockfile,
  writeWantedLockfile,
} from "@pnpm/lockfile-file";
import packageJson from "./utils/packageJson/packageJsonOperations.js";
import pnpm from "./utils/pnpm/pnpmOperations.js";
import { syncWithPnpm, syncWithWhy } from "./utils/utils.js";
import { mapValues } from "remeda";

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

// Read and update the pnpm lockfile
const lockFile = await readWantedLockfile(".", {
  ignoreIncompatible: false,
});

if (!lockFile) {
  throw new Error("No pnpm-lock.yaml file found in the current directory");
}

const mainProjectImporter = lockFile.importers["." as ProjectId];
if (!mainProjectImporter) {
  throw new Error("No main project found in pnpm-lock.yaml");
}

// Update specifiers in the main project to match package.json versions
mainProjectImporter.specifiers = mapValues(
  mainProjectImporter.specifiers,
  (_, packageName) => {
    return (
      packageJsonContents.dependencies?.[packageName] ??
      packageJsonContents.devDependencies?.[packageName] ??
      packageJsonContents.pnpm?.overrides?.[packageName] ??
      packageJsonContents.resolutions?.[packageName] ??
      _
    );
  }
);

// Update lockfile overrides to match package.json overrides/resolutions
if (lockFile.overrides) {
  lockFile.overrides = mapValues(lockFile.overrides, (_, packageName) => {
    return (
      packageJsonContents.pnpm?.overrides?.[packageName] ??
      packageJsonContents.resolutions?.[packageName] ??
      _
    );
  });
}
// Write the updated package.json back to disk
packageJson.write(packageJsonContents);
// Write the updated pnpm lockfile back to disk
writeWantedLockfile(".", lockFile);

console.log(
  "Synchronized package.json dependencies with pnpm lockfile, and wrote back specifier updates to pnpm-lock.yaml"
);
