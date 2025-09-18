export interface PnpmJsonDependencies {
  [packageName: string]: PnpmJsonDependency;
}

export interface PnpmJsonDependency {
  from: string;
  version: string;
  resolved: string;
  path: string;
  dependencies?: PnpmJsonDependencies;
}

export interface PnpmJsonProject {
  name: string;
  version: string;
  path: string;
  private: boolean;
  dependencies: PnpmJsonDependencies;
  devDependencies: PnpmJsonDependencies;
}
