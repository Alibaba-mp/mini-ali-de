import loaderUtils from 'loader-utils';
import _ from 'lodash';
import webpackTsLoader from 'ts-loader';
import ts from 'typescript';
import loaderWrapper, { LoaderFunction } from './wrapper';

const tsLoader: LoaderFunction = (loaderContext, source) => {
  try {
    return webpackTsLoader.call(loaderContext, loaderContext, source);
  } catch (err) {
    const { outputText, diagnostics, sourceMapText } = ts.transpileModule(source, {
      fileName: loaderContext.resourcePath,
      reportDiagnostics: true,
      // tslint:disable-next-line:object-literal-sort-keys
      compilerOptions: loaderUtils.getOptions(loaderContext).compilerOptions,
    });
    return [outputText, sourceMapText as any];
  }
};

export default loaderWrapper(tsLoader);
