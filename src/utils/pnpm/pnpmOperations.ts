import { execFileSync } from "node:child_process";

import { PnpmProjects } from "./PnpmProject.js";
import type { PnpmJsonProject } from "./pnpmTypes.js";

/**
 * Executes a pnpm command with JSON output and returns the parsed result.
 *
 * @param command - The pnpm command to execute (e.g., 'list', 'outdated')
 * @param args - Additional arguments to pass to the pnpm command
 * @returns The parsed JSON output from the pnpm command
 *
 * @example
 * ```typescript
 * // Get list of installed packages
 * const packages = pnpm.exec('list');
 *
 * // Get outdated packages with specific depth
 * const outdated = pnpm.exec('outdated', ['--depth=0']);
 * ```
 */
function exec<T>(command: string, args: string[] = []): T {
  return JSON.parse(
    execFileSync("pnpm", ["--json", command, ...args], { encoding: "utf-8" })
  );
}

/**
 * Executes `pnpm ls` command to list installed packages in the current workspace.
 *
 * @param depth - Optional depth parameter to limit the depth of dependency tree traversal.
 *                If not provided, lists all dependencies at all levels.
 * @returns A PnpmProjects object containing the list of projects and their dependencies.
 */
function ls(depth?: number): PnpmProjects {
  return new PnpmProjects(
    exec<PnpmJsonProject[]>(
      "ls",
      depth != null ? ["--depth", depth.toString()] : []
    )
  );
}

function why(packageName: string): PnpmProjects {
  return new PnpmProjects(exec<PnpmJsonProject[]>("why", [packageName]));
}

const pnpm = {
  ls,
  why,
  exec,
};

export default pnpm;
