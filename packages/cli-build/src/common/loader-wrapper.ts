import { loader } from 'webpack';

export type IDeLoader = (loaderContext: loader.LoaderContext, source: string) => Promise<string>;

export const webpackLoaderWrapper4De = (deLoader: IDeLoader): loader.Loader => {
  return function(this: loader.LoaderContext, source: string) {
    const callback = this.async();
    const loaderContext: loader.LoaderContext = this;
    deLoader(loaderContext, source)
      .then((result: string) => {
        callback(null, result);
      })
      .catch((error: Error) => {
        callback(error);
      });
  };
};
