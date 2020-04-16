import loaderWrapper, { LoaderFunction } from './wrapper';

const rawLoader: LoaderFunction = (loaderContext, source) => {
  return JSON.stringify(source);
};

export default loaderWrapper(rawLoader);
