import { IDic } from '@de2/shared';
import { Store } from '@de2/store';
import { IConnectProps } from './interface';
import { getMappedActOrMut as getMapped } from './mapHelper';

enum ETYPE {
  ACT = 'ACT',
  MUT = 'MUT',
}

const mapActOrMutHOC = (type: ETYPE, is4C?: boolean) => (store: Store<any, any, any, any>, extMap: IConnectProps = {}) => (app: IDic) => {
  const isACT = type === 'ACT';
  const map = isACT ? extMap.mapActions : extMap.mapMutations;
  const mapped = getMapped(store, map, isACT);

  // this.$xxxActions 不考虑支持了
  // if (isACT && !Object.keys(mapped).length) {
  //   const actions = Object.keys(store.$actions);
  //   actions.forEach(item => {
  //     const prefix = app.DE_PREFIX || '$';
  //     mapped[`${prefix}${item}`] = store.dispatch.bind(store, item);
  //   });
  // }

  Object.assign(app, mapped);

  // if (is4C) {
  //   app.methods = app.methods || {};
  //   Object.assign(app.methods, mapped);
  // } else {
  //   Object.assign(app, mapped);
  // }

  return app;
};

export const mapActions = mapActOrMutHOC(ETYPE.ACT);
export const mapActions4C = mapActOrMutHOC(ETYPE.ACT, true);
export const mapMutations = mapActOrMutHOC(ETYPE.MUT);
export const mapMutations4C = mapActOrMutHOC(ETYPE.MUT, true);
