import { loader } from 'webpack';
import { IDeLoader, webpackLoaderWrapper4De } from '../../common';
// import { invokePlugin } from '../../runtime';

const invokePluginLoader: IDeLoader = async (loaderContext: loader.LoaderContext, source: string) => {
  // console.log('invoke for ' + loaderContext.resourcePath);
  // const res = await invokePlugin({}, source);
  // console.log('invoke back for ' + loaderContext.resourcePath);
  return 'res';
};

export = webpackLoaderWrapper4De(invokePluginLoader);
