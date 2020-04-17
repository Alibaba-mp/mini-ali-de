import { normalizeDeBuildConfigToPlugins } from './build-core/config';
import { DeBuildCoreRuntime } from './build-core/core';
import { IDeBuildConfig } from './interface';

let runtime: DeBuildCoreRuntime;

export function setupRuntime(deBuildConfig: IDeBuildConfig, appxRootPath: string) {
  runtime = new DeBuildCoreRuntime();
  const plugins = normalizeDeBuildConfigToPlugins(deBuildConfig);
  runtime.init(plugins, appxRootPath);
}

export function getRuntime() {
  return runtime;
}

export * from './traverser';
