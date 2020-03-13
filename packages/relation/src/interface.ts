import { IDic } from '@de/shared';
import { Store } from '@de/store';

export interface IConnectProps {
  mapState?: TConnectPropsType;
  mapActions?: TConnectPropsType;
  mapGetters?: TConnectPropsType;
  mapMutations?: TConnectPropsType;
  // computed?: IComputedTree;
  // watch?: IWatchedTree;
  // $$resetState?: boolean;
  $$middlewares?: Array<TConnectMiddleware<IDic>>;
}

export interface IConnectorProps {
  state?: TConnectPropsType;
  actions?: TConnectPropsType;
  getters?: TConnectPropsType;
  mutations?: TConnectPropsType;
  // computed?: IComputedTree;
  // watch?: IWatchedTree;
  // $$resetState?: boolean;
  // $$middlewares?: Array<TConnectMiddleware<IDic>>;
}

export enum ESTORE_TYPE {
  MULTI = 'MULTI',
  SINGLE = 'SINGLE',
}
export type TComputed = (state: IDic) => any;
export interface IComputedTree {
  [key: string]: TComputed;
}
export type TWatched = (state: IDic) => any;
export interface IWatchedTree {
  [key: string]: TWatched;
}
export type TConnectPropsType = IDic | Array<string | IDic>;
export type TConnectMiddleware<T> = <P extends T>(store: Store<any, any, any, any>, props: IConnectProps) => (options: T) => P;

export interface IExtendsStore extends Store<any, any, any, any> {
  $$connectMiddlewares?: Array<TConnectMiddleware<IDic>>;
  $setDataHook?: (...args: any[]) => any;
}
export interface IEConnectProps extends IConnectProps {
  $$storeType?: ESTORE_TYPE;
  // $$useGlobal?: Store<any, any, any, any>;
  $$componentInitHook?: () => void;
}
