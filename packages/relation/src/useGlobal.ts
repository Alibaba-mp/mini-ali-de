/**
 * 暂时下掉
 */
import { Store } from '@de2/store';
import { connectAdvance, mapActions, mapActions4C, mapMutations, mapMutations4C, mapState, mapState4C } from './index';
import { ESTORE_TYPE, IEConnectProps } from './interface';

const connect4GHOC = (is4C?: boolean) => (store: Store<any, any, any, any>, props: IEConnectProps = {}) => {
  let args = [mapActions, mapMutations, mapState];
  if (is4C) {
    args = [mapState4C];
    props.$$componentInitHook = function() {
      mapActions4C(store, props)(this);
      mapMutations4C(store, props)(this);
    };
  }
  props.$$storeType = ESTORE_TYPE.MULTI;
  return connectAdvance(store, props)(...args);
};

export const connect4CG = connect4GHOC(true);
export const connect4PG = connect4GHOC();
