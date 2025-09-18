import { mapValues } from "remeda";

import { PackageJsonDependencies } from "./packageJson/PackageJsonTypes.js";
import { PnpmDependencies } from "./pnpm/PnpmProject.js";
import pnpm from "./pnpm/pnpmOperations.js";

/**
 * Synchronizes package.json dependencies with versions from PNPM dependencies.
 * Maps each package name to its version found in the PNPM dependency tree.
 *
 * @param packageDeps - The package.json dependencies to sync
 * @param pnpmDeps - The PNPM dependencies to source versions from
 * @returns A new dependencies object with updated versions from PNPM
 * @throws Error if any dependency is not found in PNPM dependencies
 */
export function syncWithPnpm(
  packageDeps: PackageJsonDependencies,
  pnpmDeps: PnpmDependencies
) {
  return mapValues(packageDeps, (_, packageName) => {
    const matchedDep = pnpmDeps.findPackage(packageName);
    if (matchedDep == null) {
      throw new Error(
        `Dependency ${packageName} not found in pnpm dependencies`
      );
    }
    return matchedDep.version;
  });
}

/**
 * Synchronizes package.json dependencies with versions from `pnpm why` command.
 * Uses PNPM's why operation to find the actual installed version of each package.
 *
 * @param packageDeps - The package.json dependencies to sync
 * @returns A new dependencies object with updated versions from pnpm why
 * @throws Error if any dependency is not found in pnpm why output
 */
export function syncWithWhy(packageDeps: PackageJsonDependencies) {
  return mapValues(packageDeps, (_, packageName) => {
    const found = pnpm.why(packageName).findPackage(packageName);
    if (!found) {
      throw new Error(`Dependency ${packageName} not found in pnpm why`);
    }
    return found.version;
  });
}
