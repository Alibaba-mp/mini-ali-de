import { styleCodegen } from '../codegen';
import loaderWrapper, { LoaderFunction, LoaderFunctionResponse } from './wrapper';

const lessLoader: LoaderFunction = async (loaderContext, source, sourceMap) => {
  const { resourcePath } = loaderContext;

  const options = {
    sourceMap,
    // tslint:disable-next-line:object-literal-sort-keys
    filename: resourcePath,
  };

  const { data, map } = await styleCodegen({
    data: source,
    lang: 'less',
    options,
  });

  const result: LoaderFunctionResponse = [data, map];

  return result;
};

export default loaderWrapper(lessLoader);
