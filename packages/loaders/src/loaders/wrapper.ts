import _ from 'lodash';
import { loader } from 'webpack';
import { isPromise, log } from '../utils';

export type LoaderFunctionResponse = ArgumentTypes<loader.Loader> | string | never | void;

export type LoaderFunction = (context: loader.LoaderContext, source: string, soureMap?: any) => Promise<LoaderFunctionResponse> | LoaderFunctionResponse;

// tslint:disable-next-line:no-shadowed-variable
export default function loaderWrapper(loader: LoaderFunction): loader.Loader {
  return function(source, ...args) {
    const cb = this.async();
    // tslint:disable-next-line:variable-name
    const _source = Buffer.isBuffer(source) ? source.toString('utf-8') : source;

    // tslint:disable-next-line:variable-name
    const _loader = isPromise(loader)
      ? loader
      : // tslint:disable-next-line:no-shadowed-variable
        (...args: ArgumentTypes<LoaderFunction>) =>
          new Promise<LoaderFunctionResponse>((resolve, reject) => {
            try {
              const res = loader(...args);
              resolve(res);
            } catch (err) {
              reject(err);
            }
          });

    const promise = _loader(this, _source, ...args) as Promise<LoaderFunctionResponse>;

    promise
      .then(res => {
        if (_.isArray(res)) {
          const [code, sourceMap] = res;
          cb(null, code, sourceMap);
        } else {
          cb(null, res as any);
        }
      })
      .catch(err => {
        cb(err);
        log(err);
      });
  };
}
