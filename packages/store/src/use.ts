import { TPlugin } from './interface';
import { Store } from './Store';

/**
 * global plugin apply
 * @param  {Array|Function}    args      plugins
 * @return {Function}          plugins   Store.plugins
 *
 * use(fn1);
 * use(fn1, fn2);
 * use([fn1, fn2]);
 * use(fn1, [fn2, fn3]);
 */
export function use(...plugins: Array<TPlugin<any, any, any, any> | Array<TPlugin<any, any, any, any>>>) {
  // flatten plugins and then filter out non-function plugins
  const validPlugins = plugins.reduce<Array<TPlugin<any, any, any, any>>>((ps, p) => ps.concat(p), []).filter(p => typeof p === 'function');

  Store.plugins.push(...validPlugins);

  return function unuse() {
    Store.plugins = Store.plugins.filter(storePlugin => validPlugins.every(vp => vp !== storePlugin));
  };
}
