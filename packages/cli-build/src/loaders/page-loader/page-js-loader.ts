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
import { IDePageJsLoaderOptions } from './interface';

const readFile = promisify(fs.readFile);

const pageJsLoader: IDeLoader = async (context: loader.LoaderContext, source: string) => {
  const loaderOptions: IDePageJsLoaderOptions = getOptions(context) as IDePageJsLoaderOptions;
  const appxRootPath: string = loaderOptions.appxRootPath;

  const resourcePath = context.resourcePath;
  const extName = path.extname(resourcePath);
  const dirname = path.dirname(resourcePath);
  const filename = path.basename(resourcePath, extName);

  /**
   * 解析 json 路径
   * 加入依赖
   */
  const pageJsonPath = await getPageJsonPath(dirname, filename);
  context.addDependency(pageJsonPath);

  /**
   * 解析 style 路径
   * 加入依赖
   */
  const pageACSSPath = await getPageCssPath(dirname, filename);
  context.addDependency(pageACSSPath);

  /**
   * 解析 axml 路径
   * 加入依赖
   */
  const pageAxmlPath = await getPageAxmlPath(dirname, filename);
  context.addDependency(pageAxmlPath);

  const pageResult = await getRuntime().invoke4Page({
    pageACSS: pageACSSPath
      ? {
          fileContent: (await loadModule(context, pageACSSPath)).toString(),
          filePath: pageACSSPath,
        }
      : undefined,
    pageAXML: {
      fileContent: (await loadModule(context, pageAxmlPath)).toString(),
      filePath: pageAxmlPath,
    },
    pageJS: {
      // fileContent: source,
      fileContent: await loadModule(context, resourcePath),
      filePath: resourcePath,
    },
    pageJSON: pageJsonPath
      ? {
          fileContent: await loadModule(context, pageJsonPath),
          filePath: pageJsonPath,
        }
      : undefined,
    pagePath: getPagePath(resourcePath, appxRootPath),
  });

  const acssDescribe = pageResult.acssFile;
  if (acssDescribe) {
    acssDescribe.ast = await postAcssProcess(context, acssDescribe.ast, pageACSSPath, appxRootPath);
  }

  const jsDescribe = pageResult.jsFile;
  if (jsDescribe) {
    await postJSProcess(context, jsDescribe.ast, resourcePath, appxRootPath);
  }

  const jsonDescribe = pageResult.jsonFile;
  if (jsonDescribe) {
    jsonDescribe.ast = await postJsonProcess(context, jsonDescribe.ast, pageJsonPath, appxRootPath);
  }

  const axmlDescribe = pageResult.axmlFile;
  if (axmlDescribe) {
    await postAXMLProcess(context, axmlDescribe.ast, pageAxmlPath, appxRootPath);
  }

  const codeResult = await getRuntime().generateCodeFromDescribe4Page(pageResult);

  if (codeResult.acss) {
    emitFile(context, codeResult.acss, pageACSSPath, appxRootPath);
  }

  if (codeResult.js) {
    emitFile(context, codeResult.js, resourcePath, appxRootPath);
  }

  if (codeResult.json) {
    emitFile(context, codeResult.json, pageJsonPath, appxRootPath);
  }

  if (codeResult.axml) {
    emitFile(context, codeResult.axml, pageAxmlPath, appxRootPath);
  }

  return codeResult.js;
};

async function getPageAxmlPath(dirname: string, filename: string) {
  const pageAxml = path.resolve(dirname, filename + '.axml');
  const axmlExists = await promisify(fs.exists)(pageAxml);
  if (axmlExists) {
    return pageAxml;
  } else {
    throw new Error(`页面${path.resolve(dirname, filename)}不存在 AXML 文件`);
  }
}

async function getPageJsonPath(dirname: string, filename: string) {
  const jsonPath = path.resolve(dirname, filename + '.json');
  const pageJsonExists = await promisify(fs.exists)(jsonPath);
  if (pageJsonExists) {
    return jsonPath;
  }
}

async function getPageCssPath(dirname: string, filename: string) {
  const fileExtLists = ['acss', 'css', 'less'];
  return await getFilePathByExts(fileExtLists, dirname, filename);
}

function getPagePath(jsResourcePath: string, appxRootPath: string) {
  const relative = path.relative(jsResourcePath, appxRootPath);
  return removeExt(relative);
}

export = webpackLoaderWrapper4De(pageJsLoader);
