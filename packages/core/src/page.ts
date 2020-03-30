import { connect4P /* connect4PG */ } from '@de2/relation';
import { isObject } from '@de2/shared';
import { Store } from '@de2/store';
import { IPageInstance, TPageOption } from './interface';
import { connectProps2MapProps } from './utils';

declare function Page(options: TPageOption<any, any, any, any, any, any> & ThisType<IPageInstance<any, any, any>>): void;

export function page<
  D,
  S extends Store<any, any, any, any>,
  SS extends S['state'],
  SG extends S['getters'],
  SA extends S['actions'],
  SM extends S['mutations']
>(options: TPageOption<D, S, SS, SG, SA, SM> & ThisType<IPageInstance<D, S, SS>>) {
  const { $store, mixins = [], connector } = options;
  const assign = Object.assign;

  mixins.forEach((item: any) => {
    Object.keys(item).forEach(key => {
      if (typeof item[key] === 'function') {
        const hook = options[key];
        options[key] = function(...args: any[]) {
          if (typeof hook === 'function') {
            hook.apply(this, args);
          }
          item[key].apply(this, args);
        };
      } else if (isObject(item[key])) {
        options[key] = options[key] || {};
        assign(options[key], item[key]);
      } else {
        options[key] = item[key];
      }
    });
  });

  const isStore = $store && $store.dispatch !== undefined;
  const args: any[] = [connectProps2MapProps(connector)];
  if (isStore) {
    options.$store = $store;
    args.unshift($store);
  }

  const opts = connect4P.apply(null, args)(options);

  // const $global = opts.$global;
  // if (isStore && $global && $global.dispatch !== undefined) {
  //   opts = connect4PG($global, { $$useGlobal: $global })(opts);
  // }
  return Page(opts);
}
