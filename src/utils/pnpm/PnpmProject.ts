import { entries, map, mapValues, pipe } from "remeda";

import { findMap } from "../findMap.js";
import type {
  PnpmJsonDependencies,
  PnpmJsonDependency,
  PnpmJsonProject,
} from "./pnpmTypes.js";

export class PnpmDependencies extends Map<string, PnpmDependency> {
  constructor(input: PnpmJsonDependencies) {
    try {
      super(
        pipe(
          input,
          mapValues((dep) => new PnpmDependency(dep)),
          entries()
        )
      );
    } catch (error) {
      console.log({ PnpmDependencies: input });
      console.error("Error initializing PnpmDependencies:", error);
      throw error;
    }
  }

  findPackage(findPackageName: string): PnpmDependency | undefined {
    return pipe(
      [...this.entries()],
      findMap(([packageName, dependency]) => {
        if (packageName === findPackageName) {
          return dependency;
        }
        return dependency.findPackage(findPackageName);
      })
    );
  }
}

export class PnpmDependency {
  from: string;
  version: string;
  resolved: string;
  path: string;
  dependencies?: PnpmDependencies;

  constructor(input: PnpmJsonDependency) {
    this.from = input.from;
    this.version = input.version;
    this.resolved = input.resolved;
    this.path = input.path;
    if (input.dependencies) {
      this.dependencies = new PnpmDependencies(input.dependencies);
    }
  }

  findPackage(packageName: string): PnpmDependency | undefined {
    return this.dependencies?.findPackage(packageName);
  }
}

export class PnpmProject {
  name: string;
  version: string;
  path: string;
  private: boolean;
  dependencies?: PnpmDependencies;
  devDependencies?: PnpmDependencies;

  constructor(input: PnpmJsonProject) {
    this.name = input.name;
    this.version = input.version;
    this.path = input.path;
    this.private = input.private;
    this.dependencies = input.dependencies
      ? new PnpmDependencies(input.dependencies)
      : undefined;
    this.devDependencies = input.devDependencies
      ? new PnpmDependencies(input.devDependencies)
      : undefined;
  }

  findPackage(findPackageName: string): PnpmDependency | undefined {
    return (
      this.dependencies?.findPackage(findPackageName) ??
      this.devDependencies?.findPackage(findPackageName)
    );
  }
}

export class PnpmProjects extends Array<PnpmProject> {
  constructor(input: PnpmJsonProject[]) {
    super(...map(input, (project) => new PnpmProject(project)));
  }

  findPackage(findPackageName: string): PnpmDependency | undefined {
    return findMap(this, (project) => project.findPackage(findPackageName));
  }
}
