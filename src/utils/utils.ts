import { mapValues } from "remeda";

import { PackageJsonDependencies } from "./packageJson/PackageJsonTypes.js";
import { PnpmDependencies } from "./pnpm/PnpmProject.js";
import pnpm from "./pnpm/pnpmOperations.js";

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

export function syncWithWhy(packageDeps: PackageJsonDependencies) {
  return mapValues(packageDeps, (_, packageName) => {
    const found = pnpm.why(packageName).findPackage(packageName);
    if (!found) {
      throw new Error(`Dependency ${packageName} not found in pnpm why`);
    }
    return found.version;
  });
}
