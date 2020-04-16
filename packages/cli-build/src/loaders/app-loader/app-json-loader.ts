import fs from 'fs';
import loaderUtils from 'loader-utils';
import path from 'path';
import postcss = require('postcss');
import { promisify } from 'util';
import { loader } from 'webpack';
import { getFilePathByExts, IDeLoader, kDeAppEntry, oneOfExts, removeExt, webpackLoaderWrapper4De } from '../../common';
import { emitFile, loadModule } from '../../common/webpack-helper';
import { getHelperImpl } from '../../helper';
import { getRuntime } from '../../runtime';
import { postAcssProcess } from '../post-process/acss';
import { postJSProcess } from '../post-process/js';
import { postJsonProcess } from '../post-process/json';
import { IDeAppJsonLoaderOption } from './interface';

const readFile = promisify(fs.readFile);

interface IAppOption {
  pages: string[];
}

// TODO: 判断文件是否存在
const appJsonLoader: IDeLoader = async (context: loader.LoaderContext, source: string) => {
  const loaderOption: IDeAppJsonLoaderOption = loaderUtils.getOptions(context) as IDeAppJsonLoaderOption;
  const appxRootPath: string = loaderOption.appxRootPath;
  const appJSONPath: string = context.resourcePath;
  /**
   * 找到所有 app 依赖以及 page 入口
   */
  const appJSPath = await getAppJsPath(appJSONPath);
  const appCSSPath = await getAppCssPath(appJSONPath);

  const hasAppCSS = appCSSPath !== undefined;
  const appCSSIsACSS = oneOfExts('.acss', appCSSPath);

  context.addDependency(appCSSPath);

  let appCSSContent: string;
  if (hasAppCSS) {
    if (appCSSIsACSS) {
      appCSSContent = (await readFile(appCSSPath)).toString();
    } else {
      const data = await loadModule(context, `${appCSSPath}?${kDeAppEntry}`);
      try {
        appCSSContent = JSON.parse(data);
      } catch (err) {
        appCSSContent = data;
      }
    }
  }

  const appResult = await getRuntime().invoke4App({
    appACSS: hasAppCSS
      ? {
          fileContent: appCSSContent,
          filePath: appCSSPath,
        }
      : undefined,
    appJS: {
      fileContent: await loadModule(context, appJSPath + '?' + kDeAppEntry),
      filePath: appJSPath,
    },
    appJSON: {
      fileContent: source,
      filePath: appJSONPath,
    },
  });

  /**
   * page 入口
   */
  const appConfig: IAppOption = appResult.jsonFile.ast;

  appResult.jsonFile.ast = await postJsonProcess(context, appConfig, appJSONPath, appxRootPath);
  if (hasAppCSS) {
    const acssRoot: postcss.Root = appResult.acssFile.ast;
    appResult.acssFile.ast = await postAcssProcess(context, acssRoot, appResult.acssFile.filePath, appxRootPath);
  }
  const appJSAst = appResult.jsFile.ast;
  await postJSProcess(context, appJSAst, appJSPath, appxRootPath);

  const appCode = getRuntime().generateCodeFromDescribe4App(appResult);
  emitFile(context, appCode.json, appJSONPath, appxRootPath);
  emitFile(context, appCode.js, removeExt(appJSPath) + '.js', appxRootPath);

  if (hasAppCSS && !appCSSIsACSS) {
    emitFile(context, appCode.acss, removeExt(appCSSPath) + '.acss', appxRootPath);
  }

  return appCode.json;
};

async function getAppJsPath(appJsonPath: string) {
  const dir = path.dirname(appJsonPath);
  const fileExtLists = ['js', 'ts'];
  const filename = 'app';
  return await getFilePathByExts(fileExtLists, dir, filename);
}

async function getAppCssPath(appJsonPath: string) {
  const dir = path.dirname(appJsonPath);
  const fileExtLists = ['acss', 'css', 'less'];
  const filename = 'app';
  return await getFilePathByExts(fileExtLists, dir, filename);
}

export = webpackLoaderWrapper4De(appJsonLoader);
