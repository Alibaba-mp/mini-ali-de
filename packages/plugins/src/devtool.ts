import { IDic } from '@de2/shared';
import { Store } from '@de2/store';

interface IStore extends Store<any, any, any, any> {
  _devtoolHook: (...args: any[]) => any;
  $$connectMiddlewares: any[];
}

/**
 * lunax-devtools 插件
 *
 * @example
 * import { devtools } from './jsapi';
 * new Store(options, {
 *   plugins: [
 *     createDevtool(devtools && devtools.hook)
 *   ]
 * })
 *
 * @param {object} devtoolHook
 * @param {boolean} [isSingleStore] 如果是单 store，则设为 true
 */
export function createDevtool(devtoolHook: any, isSingleStore: boolean) {
  return function devtoolPlugin(store: IStore) {
    if (!devtoolHook) {
      return;
    }

    store._devtoolHook = devtoolHook;

    devtoolHook.on('connectSocket', () => {
      devtoolHook.emit('lux:init', store);
    });

    devtoolHook.on('lux:travel-to-state', (targetState: IDic) => {
      store.replaceState(targetState);
    });

    store.subscribe((mutation, state) => {
      // 内部变化不需要通知到 devtools
      if (/^@@De\./.test(mutation.type)) {
        return;
      }

      devtoolHook.emit('lux:mutation', mutation);
    });

    // 如果每个 page 都使用自己的 store ，需要在 page 加载时告诉 devtools 进行修改
    if (!isSingleStore) {
      changeStoreOnPage(store, devtoolHook);
    }
  };
}

let currentStore: IDic;

function changeStoreOnPage(store: IStore, devtoolHook: any) {
  const myConnetMiddleware = (store: Store<any, any, any, any>, extMap: IDic) => (app: IDic) => {
    const apponLoad = app.onLoad;
    const onLoad = function(...args: any[]) {
      devtoolHook.emit('lux:changeStore', store);
      currentStore = store;

      if (typeof apponLoad === 'function') {
        apponLoad.apply(this, args);
      }
    };

    const apponShow = app.onShow;
    const onShow = function(...args: any[]) {
      if (currentStore !== store) {
        devtoolHook.emit('lux:changeStore', store);
        currentStore = store;
      }

      if (typeof apponShow === 'function') {
        apponShow.call(this, ...args);
      }
    };
    return {
      ...app,
      onLoad,
      onShow,
    };
  };

  store.$$connectMiddlewares = [myConnetMiddleware];
}
