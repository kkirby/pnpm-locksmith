export interface PackageJson {
  dependencies?: PackageJsonDependencies;
  devDependencies?: PackageJsonDependencies;
  resolutions?: PackageJsonDependencies;
  pnpm?: {
    overrides?: PackageJsonDependencies;
  };
  [key: string]: unknown;
}

export interface PackageJsonDependencies {
  [packageName: string]: string;
}
