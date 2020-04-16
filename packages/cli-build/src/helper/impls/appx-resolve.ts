import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { loader } from 'webpack';
import { oneOfExts, removeExt } from '../../common';
import { IAppXPathResolver } from '../interface';

/**
 * context 应该是绝对路径
 * 解析 appx 内路径的问题
 * 1. request 不允许 / 结尾
 * 2. request 要求 js 必须存在 + 要求 axml 必须存在
 *    1. 单文件系统要求 .de 必须存在
 * eg. appxPathResolver('/project/app.json', 'pages/a/b', 'page');
 *    1. /project/pages/a/b.json
 *    2. /project/pages/a/b/index.json
 *    3. node_modules/module(with name as pages)/a/b.json
 *    4. node_modules/module(with name as pages)/a/b/index.json
 */
export const appxPathResolver: IAppXPathResolver = async (
  loaderContext: loader.LoaderContext, // 当前json文件的地址，绝对路径
  appxRootPath: string, // 小程序的根目录，绝对路径
  request: string, // 请求的路径
  type: 'page' | 'component' | 'acss' | 'axml' | 'js' | 'sjs' = 'page' // 是页面请求还是组件请求
) => {
  const fileAbsPath = loaderContext.resourcePath;
  const context = path.dirname(fileAbsPath);
  const requestJsPath: string = requestToResourcePath(request, type);
  if (requestJsPath[0] === '/') {
    return path.join(appxRootPath, requestJsPath);
  }

  /**
   * 相对路径找
   */
  const relativeFilePath = path.resolve(context, requestJsPath);
  const relativeFileExists = await promisify(fs.exists)(relativeFilePath);
  if (relativeFileExists) {
    return relativeFilePath;
  }

  if (oneOfExts('.js', relativeFilePath)) {
    const tsPath = removeExt(relativeFilePath) + '.ts';
    const isExists = await promisify(fs.exists)(tsPath);
    if (isExists) {
      return tsPath;
    }
  }

  /**
   * node_modules 找
   */
  let nodeModulePath: string;
  try {
    nodeModulePath = await promisify(loaderContext.resolve)(context, removeExt(requestJsPath));
  } catch (e) {
    throw new Error(`您请求了一个 ${type}，但是他不存在，请求是 ${JSON.stringify(request)}`);
  }
  return nodeModulePath;
};

export function requestToResourcePath(request: string, type: 'page' | 'component' | 'acss' | 'axml' | 'js' | 'sjs'): string {
  assert(request.length, `您请求了一个 ${type}, 应该是有内容的字符串，但您写入了${JSON.stringify(request)}`);
  const length = request.length;
  const lastChar = request[length - 1];
  let ext = 'js';
  switch (type) {
    case 'acss':
      ext = 'acss';
      break;
    case 'axml':
      ext = 'axml';
      break;
    case 'sjs':
      ext = 'sjs';
      break;
    case 'js':
    case 'component':
    case 'page':
      ext = 'js';
      break;
  }
  // ide 内已经不能用了
  assert(lastChar !== '/', `您请求了一个 ${type}, 不应该以 / 符号结尾，但您写入了${JSON.stringify(request)}`);
  const hastExt = request.endsWith('.' + ext);
  if (hastExt) {
    return request;
  } else {
    return request + '.' + ext;
  }
}
