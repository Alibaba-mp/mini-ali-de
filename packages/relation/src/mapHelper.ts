import { getIn } from '@de2/helpers';
import { IDic, isRealObject } from '@de2/shared';
import { Store } from '@de2/store';

import { TConnectPropsType } from './interface';

export function getMappedState(state: IDic, mapState: TConnectPropsType = {}) {
  const mappedState = commonMapX(
    mapState,
    (item: string) => getIn(state, item),
    (mapped, item) => customMap4OBJ(mapped, item)
  );

  function customMap4OBJ(mappedState: IDic, mapState: IDic) {
    return Object.keys(mapState)
      .sort(item => Number(typeof mapState[item] === 'function'))
      .forEach(item => {
        const props = mapState[item];
        if (typeof props === 'function') {
          mappedState[item] = props.call(mappedState, state);
        } else if (typeof props === 'string') {
          // 子模块 mapState
          // mapState: { props: 'moduleA/propsB.subPropsC' }
          // mapState: { props: 'moduleA.propsB.subPropsC' }
          const alias = props.replace('/', '.');
          mappedState[item] = getIn(state, alias);
        }
      });
  }

  return mappedState;
}

export function getMappedActOrMut(store: Store<any, any, any, any>, mapAM: TConnectPropsType, isACT: boolean) {
  const callFN = isACT ? 'dispatch' : 'commit';
  const mappedAM = commonMapX(mapAM, (item: any) => store[callFN].bind(store, item));
  return mappedAM;
}

export function getMappedGetters(storeGetters: any, mapGetters: any) {
  if (!storeGetters || !mapGetters) {
    return {};
  }

  const mappedGetters = commonMapX(mapGetters, (item: any) => storeGetters[item]);
  return mappedGetters;
}

function commonMapX(mapX: any, handler: (...args: any[]) => any, customMap4OBJ?: (mappedState: any, mapState: any) => void) {
  const mapped: IDic = {};
  if (Array.isArray(mapX) && mapX.length) {
    mapX.forEach(item => {
      if (typeof item === 'string') {
        mapped[item] = handler(item);
      } else if (isRealObject(item)) {
        map4OBJ(mapped, item);
      }
    });
  } else if (isRealObject(mapX)) {
    map4OBJ(mapped, mapX);
  }

  function map4OBJ(mapped: IDic, mapX: any) {
    if (typeof customMap4OBJ === 'function') {
      return customMap4OBJ(mapped, mapX);
    }
    Object.keys(mapX).forEach(item => {
      mapped[item] = handler(mapX[item]);
    });
  }
  return mapped;
}

export function getComputed(computed: any, state: IDic, thisdata: any) {
  if (!computed) {
    return {};
  }

  const xComputed: IDic = {};
  Object.keys(computed).forEach(item => {
    const data = Object.assign(thisdata, xComputed);
    const context = { $store: this.$store, data };
    xComputed[item] = computed[item].call(context, state);
  });
  return xComputed;
}
