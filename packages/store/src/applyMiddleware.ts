import { compose } from '@de2/helpers';
import { assert } from './helper';
import { EMiddlewareHooks, TMiddleware } from './interface';
import { Store } from './Store';

// built-in plugin
export function applyMiddleware(middlewares: TMiddleware<any, any, any, any> | Array<TMiddleware<any, any, any, any>>, opts: { hook?: EMiddlewareHooks } = {}) {
  return (store: Store<any, any, any, any>) => {
    const hook = opts.hook || 'commit';
    assert(typeof store[hook] === 'function', `apply middlewares to store.${hook}. but store.${hook} is not a function`);

    if (!Array.isArray(middlewares) && typeof middlewares === 'function') {
      middlewares = [middlewares];
    }

    if (!middlewares || !middlewares.length) {
      return;
    }

    // const middlewareAPI = {
    //   getState: store.getState.bind(store),
    //   dispatch: store.dispatch.bind(store),
    //   commit: store.commit.bind(store)
    // };

    store[hook] = store[hook].bind(store);
    const hookFN = store[hook];
    const chain = middlewares.map(m => m(store, opts));
    store[hook] = compose.apply(null, chain)(hookFN);
    return store;
  };
}
