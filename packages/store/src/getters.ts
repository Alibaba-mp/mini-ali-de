import { ICommitOptions, IDic, IMutationPayload } from '@de2/shared';
import { getStateByContext } from './helper';
import { Store } from './Store';

// built-in plugin
export function getters(store: Store<any, any, any, any>) {
  const sep = '/';

  // getter cache
  let _DEGettersCache: IDic = {};
  store.getters = {};

  Object.keys(store.$getters).forEach(key => {
    Object.defineProperty(store.getters, key, {
      enumerable: true,
      get: () => getValueByGetterKey(key),
    });

    const ctx = key.split(sep);
    if (ctx.length <= 1) {
      return;
    }
    // store.getters['moduleA.itemsALen']
    // support store.getters.moduleA.itemsALen
    ctx.reduce((x, y, index) => {
      if (index === ctx.length - 1) {
        Object.defineProperty(x, y, {
          enumerable: true,
          get: () => store.getters[key],
        });
      } else {
        return (x[y] = x[y] || {});
      }
    }, store.getters);
  });

  function getValueByGetterKey(key: string) {
    if (_DEGettersCache[key]) {
      return _DEGettersCache[key];
    }

    const $getter = store.$getters[key];
    const context = $getter.context;
    // getter arguments
    const rootState = store.state;
    const cxtState = getStateByContext(rootState, context);
    const rootGetters = store.getters;
    const ctxGetters = getGettersByContext(rootGetters, context);

    const getterValue = $getter.handler.call(store, cxtState, ctxGetters, rootState, rootGetters);
    _DEGettersCache[key] = getterValue;
    return getterValue;
  }

  const oldCommit = store.commit.bind(store);
  store.commit = (type: string | IMutationPayload, payload?: IMutationPayload | ICommitOptions, opts?: ICommitOptions) => {
    // commit refresh cache
    _DEGettersCache = {};
    oldCommit(type, payload, opts);
  };

  return store;
}

export function getGettersByContext(rootGetters: IDic, context: string[]): IDic {
  const sep = '/';
  const ctxGetters = {};
  if (context.length === 0) {
    return rootGetters;
  }
  // filter ctx getter
  Object.keys(rootGetters).forEach(item => {
    const ctx = item.split(sep);
    const currentGetter = ctx.pop();
    if (ctx.join(sep) === context.join(sep)) {
      Object.defineProperty(ctxGetters, currentGetter, {
        enumerable: true,
        get: () => rootGetters[item],
      });
    }
  });
  return ctxGetters;
}
