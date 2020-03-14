import { compose } from '@de2/helpers';
import { IDic } from '@de2/shared';
import { Store } from '@de2/store';

import { ESTORE_TYPE, IEConnectProps, IExtendsStore, TConnectMiddleware } from './interface';
import { mapActions, mapActions4C, mapMutations, mapMutations4C } from './mapActOrMut';
import { mapState, mapState4C } from './mapState';
import { mapStore } from './mapStore';

let gStore: Store<any, any, any, any> = null;
export const Provider = (store: Store<any, any, any, any>) => (app: IDic) => {
  gStore = gStore || store;
  return mapStore(store)(app);
};
export const connect = connectHOC(true);
export const connect4P = connectHOC();
export const connect4C = connectHOC(true);
export const connectAdvance = (store: undefined | IExtendsStore, props?: IEConnectProps) => (...connectMiddlewares: any[]) =>
  compose(...connectMiddlewares.map(middleware => middleware(store, props)));

function connectHOC(is4C?: boolean) {
  function connect(_props?: IEConnectProps): (option: IDic) => any;
  function connect(_store: IExtendsStore, _props?: IEConnectProps): (option: IDic) => any;
  function connect(_store: IExtendsStore | IEConnectProps, _props?: IEConnectProps): (option: IDic) => any {
    let store: IExtendsStore | undefined;
    let props: IEConnectProps;

    if (checkStoreShape(_store)) {
      store = _store;
      props = _props || {};
    } else if (!checkStoreShape(_store)) {
      if (checkStoreShape(gStore)) {
        store = gStore;
        props = _store || {};
      } else {
        props = _store || {};
      }
    }

    const isGStore = checkStoreShape(gStore);
    const cmw = props.$$middlewares || [];
    const smw = (store && store.$$connectMiddlewares) || [];
    const middleware = [].concat(cmw).concat(smw);

    let args: Array<TConnectMiddleware<IDic>> = [...middleware, mapStore, mapActions, mapMutations, mapState];
    if (is4C) {
      args = [...middleware, mapState4C];
      // tslint:disable-next-line: only-arrow-functions
      props.$$componentInitHook = function() {
        const innerStore = store || this.$page.$store;
        mapStore(innerStore)(this);
        mapActions4C(innerStore, props)(this);
        mapMutations4C(innerStore, props)(this);
      };
    } else {
      if (!store) {
        throw Error('[@@De] There are no AppStore, and connect store args may not be an valid Store object');
      }
      props.$$storeType = isGStore ? ESTORE_TYPE.SINGLE : ESTORE_TYPE.MULTI;
    }
    return connectAdvance(store, props)(...args);
  }

  return connect;
}

function checkStoreShape(store: IExtendsStore | IEConnectProps): store is IExtendsStore {
  return store && (store as IExtendsStore).dispatch !== undefined;
}
