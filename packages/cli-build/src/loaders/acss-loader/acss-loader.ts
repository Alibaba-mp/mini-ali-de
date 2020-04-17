import { getOptions } from 'loader-utils';
import { loader } from 'webpack';
import { emitFile, IDeLoader, removeExt, webpackLoaderWrapper4De } from '../../common';
import { getRuntime } from '../../runtime';
import { postAcssProcess } from '../post-process/acss';
import { IDeExtraACSSLoaderOptions } from './interface';

const extraACSSLoader: IDeLoader = async (context: loader.LoaderContext, source: string) => {
  const filePath = context.resourcePath;
  const loaderOptions = getOptions(context) as IDeExtraACSSLoaderOptions;
  const appxRootPath = loaderOptions.appxRootPath;
  const extraACSSDescribe = await getRuntime().invoke4ExtraACSS({
    fileContent: source,
    filePath,
  });

  extraACSSDescribe.ast = await postAcssProcess(context, extraACSSDescribe.ast, filePath, appxRootPath);

  const code = await getRuntime().generateCodeFromDescribe4ExtraACSS(extraACSSDescribe);

  emitFile(context, code, removeExt(filePath) + '.acss', appxRootPath);

  return '';
};

export = webpackLoaderWrapper4De(extraACSSLoader);
