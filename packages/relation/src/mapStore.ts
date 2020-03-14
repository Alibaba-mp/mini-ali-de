import { IDic } from '@de2/shared';
import { Store } from '@de2/store';

/**
 * connect 中间件
 * 向 options 里注入 $store
 *
 * @param  {Object} store  状态管理实例
 * @return {Object}        返回的 options 参数
 */
export const mapStore = (store: Store<any, any, any, any>) => (options: IDic) => {
  const prefix = options.DE_PREFIX || '$';

  Object.assign(options, {
    [`${prefix}store`]: store,
    [`${prefix}watch`]: store.watch.bind(store),
    [`${prefix}commit`]: store.commit.bind(store),
    [`${prefix}dispatch`]: store.dispatch.bind(store),
    get [`${prefix}state`]() {
      return store.state;
    },
    get [`${prefix}getters`]() {
      return store.getters;
    },
  });

  return options;
};
