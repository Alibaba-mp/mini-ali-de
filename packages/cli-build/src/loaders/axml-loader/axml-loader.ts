import { getOptions } from 'loader-utils';
import { loader } from 'webpack';
import { emitFile, IDeLoader, webpackLoaderWrapper4De } from '../../common';
import { getRuntime } from '../../runtime';
import { postAXMLProcess } from '../post-process/axml';
import { IDeAxmlLoaderOptions } from './interface';

const deAxmlProcess: IDeLoader = async (context: loader.LoaderContext, source: string) => {
  const axmlPath = context.resourcePath;
  const loaderOptions = getOptions(context) as IDeAxmlLoaderOptions;
  const appxRootPath = loaderOptions.appxRootPath;
  const axml = await getRuntime().invoke4ExtraAxml({
    fileContent: source,
    filePath: axmlPath,
  });
  await postAXMLProcess(context, axml.ast, axmlPath, appxRootPath);
  const code = await getRuntime().generateCodeFromDescribe4ExtraAXML(axml);
  emitFile(context, code, axmlPath, appxRootPath);
  return '';
};

export = webpackLoaderWrapper4De(deAxmlProcess);
