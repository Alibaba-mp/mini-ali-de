import loaderUtils from 'loader-utils';
import path from 'path';
import { loader } from 'webpack';
import { IDeLoader, webpackLoaderWrapper4De } from '../../common';
import { getHelperImpl } from '../../helper';
import { IDeNodeModuleJsonLoaderOption } from './interface';

interface IDeAppxJson {
  pages?: string[];
  usingComponents?: Record<string, string>;
}

const nodeModuleJsonLoader: IDeLoader = async (context: loader.LoaderContext, source: string) => {
  const loaderOption: IDeNodeModuleJsonLoaderOption = loaderUtils.getOptions(context) as IDeNodeModuleJsonLoaderOption;
  const appxJson: IDeAppxJson = JSON.parse(source);
  const sourceDirName = path.dirname(context.resourcePath);
  const helper = getHelperImpl();
  if (appxJson.pages) {
    const normalizedPage: string[] = [];
    for (const page of appxJson.pages) {
      const pageJsPath = await helper.appxPathResolver(context, loaderOption.appxRootPath, page);
      const pageRelativePath = path.relative(sourceDirName, pageJsPath);
      normalizedPage.push(removeExt(pageRelativePath));
    }
    appxJson.pages = normalizedPage;
  }
  if (appxJson.usingComponents) {
    const keys = Object.keys(appxJson.usingComponents);
    for (const componentName of keys) {
      const componentPath = appxJson.usingComponents[componentName];
      const pageJsPath = await helper.appxPathResolver(context, loaderOption.appxRootPath, componentPath);
      const pageRelativePath = path.relative(sourceDirName, pageJsPath);
      appxJson.usingComponents[componentName] = removeExt(pageRelativePath);
    }
  }
  return JSON.stringify(appxJson, null, 2);
};

function removeExt(filePath: string) {
  const extname = path.extname(filePath);
  const extLen = extname.length;
  return filePath.substr(0, filePath.length - extLen);
}

export = webpackLoaderWrapper4De(nodeModuleJsonLoader);
