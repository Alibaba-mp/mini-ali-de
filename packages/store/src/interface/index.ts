import { IBatch, ICommitOptions, IDispatchOptions, IMutationPayload } from '@de2/shared';
import { Store } from '../';

export { EMiddlewareHooks, TMiddleware } from './middleware';

export interface IActionContext<S, G, M, A> {
  state: S;
  rootState: S;
  getters: G;
  rootGetters: G;
  dispatch<T extends keyof A = keyof A>(name: T, payload?: A[T], options?: IDispatchOptions): Promise<any>;
  dispatch<T extends keyof A = keyof A>(
    payloadWithType: {
      type: T;
      [key: string]: any;
    },
    options?: IDispatchOptions
  ): Promise<any>;

  commit(payload: Partial<S>, options?: ICommitOptions): void;
  commit<T extends keyof M>(type: T, payload?: M[T], options?: ICommitOptions): void;
  commit<T extends keyof M>(payloadWithType: { type: T; [key: string]: any }, options?: ICommitOptions): void;
}

export interface IModule<S, G, M, A> {
  state?: S;
  actions?: {
    [K in keyof A]: (this: Store<S, G, M, A>, injectee: IActionContext<S, G, M, A>, payload: A[K]) => any;
  };
  mutations?: {
    [K in keyof M]: (this: Store<S, G, M, A>, state: S, payload: M[K]) => void;
  };
  getters?: {
    [K in keyof G]: (state: S) => G[K];
  };
  modules?: { [key: string]: IModule<any, any, any, any> };
  deps?: IDeepTree<S, G, M, A> | (() => IDeepTree<S, G, M, A>);
  batch?: IBatch | boolean;
  plugins?: Array<TPlugin<S, G, M, A>>;
}

export type TGetter<S, G, M, A> = (this: Store<S, G, M, A>, state: S, getters: any, rootState: S, rootGetters: any) => any;
// export type TGetter<S, R> = (this: Store<R>, injectee: IGetterContext<S, R>) => any;
export type TAction<S, G, M, A> = (this: Store<S, G, M, A>, injectee: IActionContext<S, G, M, A>, payload?: any) => any;
export type TMutation<S, G, M, A> = (this: Store<S, G, M, A>, state: S, payload?: any) => any;
export type TPlugin<S, G, M, A> = (store: Store<S, G, M, A>) => any;
export type TDeps<S, G, M, A> = Store<S, G, M, A>;

export interface IModuleTree<S, G, M, A> {
  [key: string]: IModule<S, G, M, A>;
}
export interface IGetterTree<S, G, M, A> {
  [key: string]: TGetter<S, G, M, A>;
}
export interface IActionTree<S, G, M, A> {
  [key: string]: TAction<S, G, M, A>;
}
export interface IMutationTree<S, G, M, A> {
  [key: string]: TMutation<S, G, M, A>;
}
export interface IDeepTree<S, G, M, A> {
  [key: string]: Store<S, G, M, A>;
}

export interface IInnerMutation<S, G, M, A> {
  name: string;
  context: string[];
  handler: TMutation<S, G, M, A>;
}

export interface IInnerAction<S, G, M, A> {
  name: string;
  context: string[];
  handler: TAction<S, G, M, A>;
}
export interface IInnerGetter<S, G, M, A> {
  name: string;
  context: string[];
  handler: TGetter<S, G, M, A>;
}
export interface IInnerMutationTree<S, G, M, A> {
  [key: string]: IInnerMutation<S, G, M, A>;
}
export interface IInnerActionTree<S, G, M, A> {
  [key: string]: IInnerAction<S, G, M, A>;
}
export interface IInnerGetterTree<S, G, M, A> {
  [key: string]: IInnerGetter<S, G, M, A>;
}
