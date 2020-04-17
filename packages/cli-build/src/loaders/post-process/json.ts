import path from 'path';
import { loader } from 'webpack';
import { kDeComponentEntry, kDePageEntry, loadModule, removeExt, startsWith } from '../../common';
import { getHelperImpl } from '../../helper';

interface IDeAppxJson {
  pages?: string[];
  usingComponents?: Record<string, string>;
}

export async function postJsonProcess(context: loader.LoaderContext, appxJson: IDeAppxJson, jsonPath: string, appxRootPath: string) {
  const sourceDirName = path.dirname(jsonPath);
  const helper = getHelperImpl();
  if (appxJson.pages) {
    const normalizedPage: string[] = [];
    for (const page of appxJson.pages) {
      const pageJsPath = await helper.appxPathResolver(context, appxRootPath, page);
      const pageRelativePath = path.relative(sourceDirName, pageJsPath);
      normalizedPage.push(removeExt(pageRelativePath));
      await loadModule(context, pageJsPath + '?' + kDePageEntry);
    }
    appxJson.pages = normalizedPage;
  }
  if (appxJson.usingComponents) {
    const keys = Object.keys(appxJson.usingComponents);
    for (const componentName of keys) {
      const componentPath = appxJson.usingComponents[componentName];
      const pageJsPath = await helper.appxPathResolver(context, appxRootPath, componentPath);
      const pageRelativePath = path.relative(sourceDirName, pageJsPath);
      const relativePath = removeExt(startsWith(pageRelativePath, ['.', '/']) ? pageRelativePath : './' + pageRelativePath);
      appxJson.usingComponents[componentName] = relativePath;
      await loadModule(context, relativePath + '?' + kDeComponentEntry);
    }
  }
  return appxJson;
}
