import { entries, map, mapValues, pipe } from "remeda";

import { findMap } from "../findMap.js";
import type {
  PnpmJsonDependencies,
  PnpmJsonDependency,
  PnpmJsonProject,
} from "./pnpmTypes.js";

/**
 * A Map-based collection of PNPM dependencies with search capabilities.
 * Extends Map<string, PnpmDependency> to provide package lookup functionality.
 */
export class PnpmDependencies extends Map<string, PnpmDependency> {
  /**
   * Creates a new PnpmDependencies instance from JSON dependencies data.
   * @param input - The raw JSON dependencies object
   */
  constructor(input: PnpmJsonDependencies) {
    super(
      pipe(
        input,
        mapValues((dep) => new PnpmDependency(dep)),
        entries()
      )
    );
  }

  /**
   * Recursively searches for a package by name in this dependency tree.
   * @param findPackageName - The name of the package to find
   * @returns The found PnpmDependency or undefined if not found
   */
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

/**
 * Represents a single PNPM dependency with its metadata and nested dependencies.
 */
export class PnpmDependency {
  /** The original package specifier */
  from: string;
  /** The resolved version of the package */
  version: string;
  /** The resolved URL or path to the package */
  resolved: string;
  /** The file system path to the package */
  path: string;
  /** Nested dependencies of this package */
  dependencies?: PnpmDependencies;

  /**
   * Creates a new PnpmDependency instance from JSON dependency data.
   * @param input - The raw JSON dependency object
   */
  constructor(input: PnpmJsonDependency) {
    this.from = input.from;
    this.version = input.version;
    this.resolved = input.resolved;
    this.path = input.path;
    if (input.dependencies) {
      this.dependencies = new PnpmDependencies(input.dependencies);
    }
  }

  /**
   * Searches for a package by name in this dependency's nested dependencies.
   * @param packageName - The name of the package to find
   * @returns The found PnpmDependency or undefined if not found
   */
  findPackage(packageName: string): PnpmDependency | undefined {
    return this.dependencies?.findPackage(packageName);
  }
}

/**
 * Represents a PNPM project with its metadata and dependencies.
 */
export class PnpmProject {
  /** The project name */
  name: string;
  /** The project version */
  version: string;
  /** The file system path to the project */
  path: string;
  /** Whether this is a private package */
  private: boolean;
  /** Production dependencies */
  dependencies?: PnpmDependencies;
  /** Development dependencies */
  devDependencies?: PnpmDependencies;

  /**
   * Creates a new PnpmProject instance from JSON project data.
   * @param input - The raw JSON project object
   */
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

  /**
   * Searches for a package by name in both production and development dependencies.
   * @param findPackageName - The name of the package to find
   * @returns The found PnpmDependency or undefined if not found
   */
  findPackage(findPackageName: string): PnpmDependency | undefined {
    return (
      this.dependencies?.findPackage(findPackageName) ??
      this.devDependencies?.findPackage(findPackageName)
    );
  }
}

/**
 * An array-based collection of PNPM projects with search capabilities.
 * Extends Array<PnpmProject> to provide package lookup across all projects.
 */
export class PnpmProjects extends Array<PnpmProject> {
  /**
   * Creates a new PnpmProjects instance from an array of JSON project data.
   * @param input - Array of raw JSON project objects
   */
  constructor(input: PnpmJsonProject[]) {
    super(...map(input, (project) => new PnpmProject(project)));
  }

  /**
   * Searches for a package by name across all projects in the collection.
   * @param findPackageName - The name of the package to find
   * @returns The found PnpmDependency or undefined if not found in any project
   */
  findPackage(findPackageName: string): PnpmDependency | undefined {
    return findMap(this, (project) => project.findPackage(findPackageName));
  }
}
