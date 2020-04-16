import { loader } from 'webpack';
import { IDeLoader, webpackLoaderWrapper4De } from '../../common';

interface IPageJSON {
  usingComponents: Record<string, string>;
}

const pageJsonLoader: IDeLoader = async (context: loader.LoaderContext, source: string) => {
  const pageJson: IPageJSON = JSON.parse(source);
  const usingComponents = pageJson.usingComponents;
  if (!usingComponents) {
    return '';
  }
  const componentNames = Object.keys(usingComponents);
  const componentRequests = componentNames.map($ => usingComponents[$]);
  return '';
};

export = webpackLoaderWrapper4De(pageJsonLoader);
