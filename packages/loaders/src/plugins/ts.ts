import _ from 'lodash';
import path from 'path';
import { Compiler, loader, Plugin } from 'webpack';
import { SCRIPT_EXT, TS_EXT } from '../contants';

export default class TSLoaderPlugin implements Plugin {
  public apply(compiler: Compiler) {
    const id = this.constructor.name;
    compiler.hooks.compilation.tap(id, compilation => {
      compilation.hooks.normalModuleLoader.tap(id, (loaderContext: loader.LoaderContext, module) => {
        const { emitFile } = loaderContext;

        loaderContext.emitFile = (name, content, sourceMap) => {
          if (path.extname(name) === TS_EXT) {
            const pathObj = path.parse(name);
            pathObj.ext = SCRIPT_EXT;
            pathObj.base = path.basename(pathObj.base, TS_EXT) + SCRIPT_EXT;

            name = path.format(pathObj);
          }

          return emitFile.call(module, name, content, sourceMap);
        };
      });
    });
  }
}
