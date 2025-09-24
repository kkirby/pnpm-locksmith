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
import path from "node:path";

const cwd = process.cwd();

function getProjectImporterPath(projectPath: string): ProjectId {
  const importerPath = path.relative(cwd, projectPath);
  return (importerPath.length == 0 ? "." : importerPath) as ProjectId;
}

// Read and update the pnpm lockfile
const lockFile = await readWantedLockfile(".", {
  ignoreIncompatible: false,
});

if (!lockFile) {
  throw new Error("No pnpm-lock.yaml file found in the current directory");
}

// Get the main project from pnpm lockfile (first project in the list)
for (const pnpmProject of pnpm.ls({
  recursive: true,
  depth: 0,
})) {
  const packageJsonContents = packageJson.read(pnpmProject.path);

  // Sync production dependencies if both package.json and pnpm have them
  if (
    packageJsonContents.dependencies != null &&
    pnpmProject.dependencies != null
  ) {
    packageJsonContents.dependencies = syncWithPnpm(
      packageJsonContents.dependencies,
      pnpmProject.dependencies
    );
  }

  // Sync development dependencies if both package.json and pnpm have them
  if (
    packageJsonContents.devDependencies != null &&
    pnpmProject.devDependencies != null
  ) {
    packageJsonContents.devDependencies = syncWithPnpm(
      packageJsonContents.devDependencies,
      pnpmProject.devDependencies
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

  const projectImporter =
    lockFile.importers[getProjectImporterPath(pnpmProject.path)];
  if (!projectImporter) {
    throw new Error("No main project found in pnpm-lock.yaml");
  }

  // Update specifiers in the main project to match package.json versions
  projectImporter.specifiers = mapValues(
    projectImporter.specifiers,
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
  packageJson.write(pnpmProject.path, packageJsonContents);
  // Write the updated pnpm lockfile back to disk
}

writeWantedLockfile(".", lockFile);

console.log(
  "Synchronized package.json dependencies with pnpm lockfile, and wrote back specifier updates to pnpm-lock.yaml"
);

// Read the current package.json file
