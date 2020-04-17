import fs from 'fs';
import { getOptions } from 'loader-utils';
import path from 'path';
import { promisify } from 'util';
import { loader } from 'webpack';
import { emitFile, getFilePathByExts, IDeLoader, loadModule, oneOfExts, removeExt, webpackLoaderWrapper4De } from '../../common';
import { getRuntime } from '../../runtime';
import { postJsonProcess } from '../post-process';
import { postAcssProcess } from '../post-process/acss';
import { postAXMLProcess } from '../post-process/axml';
import { postJSProcess } from '../post-process/js';
import { IDeComponentLoaderOption } from './interface';

const readFile = promisify(fs.readFile);

const componentJsLoader: IDeLoader = async (context: loader.LoaderContext, source: string) => {
  const loaderOptions: IDeComponentLoaderOption = getOptions(context) as IDeComponentLoaderOption;
  const appxRootPath: string = loaderOptions.appxRootPath;

  const resourcePath = context.resourcePath;
  const extName = path.extname(resourcePath);
  const dirname = path.dirname(resourcePath);
  const filename = path.basename(resourcePath, extName);

  /**
   * 解析 json 路径
   * 加入依赖
   */
  const componentJsonPath = await getComponentJsonPath(dirname, filename);
  context.addDependency(componentJsonPath);

  /**
   * 解析 style 路径
   * 加入依赖
   */
  const componentACSSPath = await getComponentCssPath(dirname, filename);
  context.addDependency(componentACSSPath);

  /**
   * 解析 axml 路径
   * 加入依赖
   */
  const componentAxmlPath = await getComponentAxmlPath(dirname, filename);
  context.addDependency(componentAxmlPath);

  const componentResult = await getRuntime().invoke4Component({
    componentACSS: componentACSSPath
      ? {
          fileContent: (await loadModule(context, componentACSSPath)).toString(),
          filePath: componentACSSPath,
        }
      : undefined,
    componentAXML: {
      fileContent: (await loadModule(context, componentAxmlPath)).toString(),
      filePath: componentAxmlPath,
    },
    componentJS: {
      fileContent: await loadModule(context, resourcePath),
      filePath: resourcePath,
    },
    componentJSON: componentJsonPath
      ? {
          fileContent: await loadModule(context, componentJsonPath),
          filePath: componentJsonPath,
        }
      : undefined,
    componentPath: getComponentPath(resourcePath, appxRootPath),
  });

  const acssDescribe = componentResult.acssFile;
  if (acssDescribe) {
    acssDescribe.ast = await postAcssProcess(context, acssDescribe.ast, componentACSSPath, appxRootPath);
  }

  const jsDescribe = componentResult.jsFile;
  if (jsDescribe) {
    await postJSProcess(context, jsDescribe.ast, resourcePath, appxRootPath);
  }

  const jsonDescribe = componentResult.jsonFile;
  if (jsonDescribe) {
    jsonDescribe.ast = await postJsonProcess(context, jsonDescribe.ast, componentJsonPath, appxRootPath);
  }

  const axmlDescribe = componentResult.axmlFile;
  if (axmlDescribe) {
    await postAXMLProcess(context, axmlDescribe.ast, componentAxmlPath, appxRootPath);
  }

  const codeResult = await getRuntime().generateCodeFromDescribe4Component(componentResult);

  if (codeResult.acss) {
    emitFile(context, codeResult.acss, componentACSSPath, appxRootPath);
  }

  if (codeResult.js) {
    emitFile(context, codeResult.js, resourcePath, appxRootPath);
  }

  if (codeResult.json) {
    emitFile(context, codeResult.json, componentJsonPath, appxRootPath);
  }

  if (codeResult.axml) {
    emitFile(context, codeResult.axml, componentAxmlPath, appxRootPath);
  }

  return codeResult.js;
};

async function getComponentAxmlPath(dirname: string, filename: string) {
  const fileExt = 'axml';
  const filePath = await getFilePathByExts(fileExt, dirname, filename);
  if (filePath) {
    return filePath;
  } else {
    throw new Error(`页面${path.resolve(dirname, filename)}不存在 AXML 文件`);
  }
}

async function getComponentJsonPath(dirname: string, filename: string) {
  const fileExt = 'json';
  return await getFilePathByExts(fileExt, dirname, filename);
}

async function getComponentCssPath(dirname: string, filename: string) {
  const fileExtLists = ['acss', 'css', 'less'];
  return await getFilePathByExts(fileExtLists, dirname, filename);
}

function getComponentPath(jsResourcePath: string, appxRootPath: string) {
  const relative = path.relative(jsResourcePath, appxRootPath);
  return removeExt(relative);
}

export = webpackLoaderWrapper4De(componentJsLoader);
