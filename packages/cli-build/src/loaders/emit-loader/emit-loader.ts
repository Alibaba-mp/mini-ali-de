import loaderUtils from 'loader-utils';
import path from 'path';
import { loader } from 'webpack';
import { IDeLoader, webpackLoaderWrapper4De } from '../../common';
import { getHelperImpl } from '../../helper';
import { IDeEmitLoaderOption } from './interface';

interface IAppXAppJson {
  pages: string[];
}

const deEmitLoader: IDeLoader = async (context: loader.LoaderContext, source: string) => {
  const loaderOption: IDeEmitLoaderOption = loaderUtils.getOptions(context) as IDeEmitLoaderOption;

  const absolutePath = context.resourcePath;
  const sourceRoot = loaderOption.appxRootPath;
  const relativePathToSourceRoot = path.relative(sourceRoot, absolutePath);

  context.emitFile(relativePathToSourceRoot, source, false);

  return source;
};

export = webpackLoaderWrapper4De(deEmitLoader);
