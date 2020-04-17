import { stringifyRequest } from 'loader-utils';
import path from 'path';
import { loader } from 'webpack';

export async function loadModule(context: loader.LoaderContext, request: string) {
  return new Promise<string>((resolve, reject) => {
    context.loadModule(request, (error, source) => {
      if (error) {
        return reject(error);
      } else {
        return resolve(source);
      }
    });
  });
}

export function emitFile(context: loader.LoaderContext, source: string, resourcePath: string, appxRootPath: string) {
  const target = path.relative(appxRootPath, resourcePath);
  context.emitFile(target, source, false);
}

export async function stringifyQuery() {}
