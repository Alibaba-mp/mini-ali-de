import loaderUtils, { getOptions } from 'loader-utils';
import path from 'path';
import { loader } from 'webpack';
import { emitFile, IDeLoader, loadModule, webpackLoaderWrapper4De } from '../../common';
import { getHelperImpl } from '../../helper';
import { getRuntime } from '../../runtime';
import { postJSProcess } from '../post-process/js';
import { IDeJSLoaderOption } from './interface';

interface IAppXAppJson {
  pages: string[];
}

const deJSLoader: IDeLoader = async (context: loader.LoaderContext, source: string) => {
  const jsPath = context.resourcePath;
  const loaderOption = getOptions(context) as IDeJSLoaderOption;
  const appxRootPath = loaderOption.appxRootPath;

  const js = await getRuntime().invoke4ExtraJS({
    fileContent: source,
    filePath: jsPath,
  });

  await postJSProcess(context, js.ast, jsPath, appxRootPath);

  const code = await getRuntime().generateCodeFromDescribe4ExtraJS(js);

  emitFile(context, code, jsPath, appxRootPath);

  return code;
};

export = webpackLoaderWrapper4De(deJSLoader);
