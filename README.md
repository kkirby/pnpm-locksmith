# pnpm-locksmith

[![License: Unlicense](https://img.shields.io/badge/license-Unlicense-blue.svg)](LICENSE)

Synchronize your package.json to match the exact versions in your pnpm lockfile.

This CLI updates:

- `dependencies` and `devDependencies`: pins each entry to the version currently installed (from pnpm ls --json)
- `resolutions` and `pnpm.overrides`: sets each entry to the version reported by `pnpm why PACKAGE_NAME`

It writes changes back to package.json.

## Why

Keeping package.json versions aligned with the lockfile helps you:

- Make diffs clearer (no “^/~” ranges when you really want the locked version)
- Improve reproducibility (what’s installed is exactly what’s declared)
- Reduce accidental upgrades when teammates or CI install

## Requirements

- Node.js 18+ (recommended)
- pnpm installed and on your PATH
- An existing pnpm-lock.yaml (i.e., you’ve already run pnpm install)

## Usage

Run the tool in the root of the package/workspace you want to update.

- One-off (no install):

```sh
pnpm dlx @kkirbatski/pnpm-locksmith
```

- As a dev dependency:

```sh
pnpm add -D @kkirbatski/pnpm-locksmith
pnpm exec pnpm-locksmith
```

What to expect:

- The command updates package.json in place.
- If a dependency in package.json cannot be found in the current pnpm dependency graph, the tool will error (ensure you’ve installed first).

Tip: run under version control so you can quickly review or revert changes.

```sh
git diff package.json
# If needed
git checkout -- package.json
```

## How it works

- Reads the current `package.json`
- Reads your dependency graph via `pnpm ls --json`
- For each key in `dependencies` and `devDependencies`, finds the installed version, and writes that exact version back to `package.json`
- If a `resolutions` or `pnpm.overrides` field exists, runs `pnpm why PACKAGE_NAME --json` and uses the reported version
- Writes the updated `package.json` to disk

## Notes and limitations

- The tool expects dependencies in `package.json` to already be installed. Run `pnpm install` first.
- Monorepos: Should work.
- This tool does not add or remove dependencies; it only updates existing version strings.

## Development

- Build:

```sh
pnpm install
pnpm build
```

- Run from source:

```sh
node build/pnpm-locksmith.js
```

## License

This project is dedicated to the public domain under The Unlicense. See the `LICENSE` file for details.
