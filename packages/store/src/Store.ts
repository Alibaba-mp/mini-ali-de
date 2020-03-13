import { deleteIn, getIn, setIn, updateIn } from '@de/helpers';
import { IActionPayload, ICommitOptions, IDispatchOptions, IMutationPayload, IPActionPayload, IPMutationPayload, IWatch } from '@de/shared';

import { produce } from 'immer';
import { batch } from './batch';
import { getGettersByContext, getters } from './getters';
import { argcAdapter, assert, extractState, getStateByContext, mapModulePropsTo$Props, warn } from './helper';
import { IDeepTree, IInnerActionTree, IInnerGetterTree, IInnerMutationTree, IModule, TDeps, TPlugin } from './interface';
import { watch } from './watch';

export class Store<S = { [key: string]: any }, G = any, M = any, A = any> {
  get state() {
    return this._currentState;
  }
  set state(v) {
    assert(false, 'use store.replaceState() to replace store state');
  }
  public static plugins: Array<TPlugin<any, any, any, any>> = [];
  public _currentState: S;
  public $module: IModule<S, G, M, A>;
  public $mutations: IInnerMutationTree<S, G, M, A> = {};
  public $actions: IInnerActionTree<S, G, M, A> = {};
  public $getters: IInnerGetterTree<S, G, M, A> = {};
  public $deps: (() => IDeepTree<S, G, M, A>) | IDeepTree<S, G, M, A>;
  public getters: G;
  public actions: A;
  public mutations: M;
  public watch: IWatch<S, G, any>;
  public commitIM: <T extends keyof M>(
    _type: T | Partial<S> | { type: T; [key: string]: any },
    _payload?: M[T] | ICommitOptions,
    _opts?: ICommitOptions
  ) => void;
  public when: <T>(predicate: (newState: Partial<S>) => boolean, effect: (mutation: IPMutationPayload, state: T, oldValue: T) => any) => void;

  private _nextListeners: Array<(mutation: IPMutationPayload, state: S, oldValue: S) => any>;
  private _currentListeners: Array<(mutation: IPMutationPayload, state: S, oldValue: S) => any>;
  private _actionListeners: Array<(mutation: IPActionPayload, state: S) => any>;

  constructor(module: IModule<S, G, M, A> = {}) {
    this._currentState = extractState(module);
    this._nextListeners = this._currentListeners = [];
    this._actionListeners = [];

    // $xxx for plugins
    this.$module = module || {};
    this.$mutations = {};
    this.$actions = {};
    this.$getters = {};
    this.$deps = module.deps || {};
    // this.getters = {};
    this._mapModulePropsTo$Props(module);

    // apply inner plugin
    watch(this);
    getters(this);
    batch(this, module.batch);

    Store.plugins.concat(module.plugins || []).forEach(p => p(this));
  }

  public getState() {
    return this._currentState;
  }

  public replaceState(state: any) {
    const prevState = this._currentState;
    const nextState = state;
    this._currentState = nextState;
    this._execSubscribes({ type: '@@De.ReplaceState', payload: undefined }, nextState, prevState);
  }

  public resetState() {
    this._currentState = extractState(this.$module);
  }

  public subscribe(callback: (mutation: IPMutationPayload, state: S, oldValue: S) => any, opts?: { prepend: boolean }): () => void {
    const self = this;
    this._ensureCanMutateNextListeners();
    opts && opts.prepend ? this._nextListeners.unshift(callback) : this._nextListeners.push(callback);

    return function unsubscribe(): void {
      self._ensureCanMutateNextListeners();
      const listeners = self._nextListeners;
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }

  public subscribeAction(beforeFN: (action: IPActionPayload, state: S) => any): () => void {
    const self = this;
    const subs = this._actionListeners;
    if (subs.indexOf(beforeFN) < 0) {
      subs.push(beforeFN);
    }
    return function unsubscribeAction(): void {
      const _subs = self._actionListeners;
      const i = _subs.indexOf(beforeFN);
      if (i > -1) {
        _subs.splice(i, 1);
      }
    };
  }

  public commit<T extends keyof M>(payload: Partial<S>, options?: ICommitOptions): void;
  public commit<T extends keyof M>(payloadWithType: { type: T; [key: string]: any }, options?: ICommitOptions): void;
  public commit<T extends keyof M>(type: T, payload?: M[T], options?: ICommitOptions): void;
  public commit<T extends keyof M>(_type: T | { type: T; [key: string]: any } | Partial<S>, _payload?: M[T] | ICommitOptions, _opts?: ICommitOptions): void {
    const { type = '@@DeUpdateView', payload, opts } = argcAdapter(_type, _payload, _opts);
    // dep store commit
    if (this._callDepStoreFN(type, payload, opts, 'commit')) {
      return;
    }
    // commit extinfo
    const meta = opts && opts.meta;
    const currentState = this._currentState;
    const mutation = this.$mutations[type];
    assert(!!mutation, `mutation ${type} does not exist`);

    // apply produce
    const context = mutation.context;
    const nextState = produce(currentState, (draft: any) => {
      const ctxState = getStateByContext(draft, context);
      mutation.handler.call(this, ctxState, payload, {
        deleteIn,
        getIn,
        setIn,
        updateIn,
      });
    });

    this._currentState = nextState;
    this._execSubscribes({ type, payload, meta }, nextState, currentState);
    // return nextState;
  }

  public dispatch<T extends keyof A>(payloadWithType: { type: T; [key: string]: any }, options?: IDispatchOptions): Promise<any>;
  public dispatch<T extends keyof A>(type: T, payload?: A[T], options?: IDispatchOptions): Promise<any>;
  public dispatch<T extends keyof A>(_type: T | { type: T; [key: string]: any }, _payload?: A[T] | IDispatchOptions, _opts?: IDispatchOptions) {
    const { type, payload, opts } = argcAdapter(_type, _payload, _opts);

    // thunk
    if (typeof type === 'function') {
      const dispatch = this.dispatch.bind(this);
      const state = this.getState();
      return type(payload, opts)(dispatch, state);
    }
    // dep store dispatch
    if (this._callDepStoreFN(type, payload, opts, 'dispatch')) {
      return;
    }
    const currentState = this._currentState;
    const action = this.$actions[type];
    if (!action) {
      warn(!!action, `action ${type} does not exist`);
      return;
    }

    const context = action.context;
    const sep = '/';
    const getDeep = (type: string) => context.concat(type).join(sep);

    const self = this;
    const dispatchAPI = {
      commit: (_type: string | IMutationPayload, _payload?: IMutationPayload | ICommitOptions, _opts?: ICommitOptions) => {
        const { type = '@@DeUpdateView', payload, opts } = argcAdapter(_type, _payload, _opts);
        return this.commit(opts.root ? type : getDeep(type), payload, opts);
      },
      deps: this.$deps,
      dispatch: (_type: string | IActionPayload, _payload?: IActionPayload | IDispatchOptions, _opts?: IDispatchOptions) => {
        const { type, payload, opts } = argcAdapter(_type, _payload, _opts);
        return this.dispatch(opts.root ? type : getDeep(type), payload, opts);
      },
      getIn,
      getters: getGettersByContext(this.getters, context),
      rootGetters: this.getters,
      get rootState() {
        return self.getState();
      },
      get state() {
        return getStateByContext(self.getState(), context);
      },
      // rootState: currentState,
      // state: getStateByContext(currentState, context),
    };

    // before
    this._actionListeners.forEach(sub => sub({ type, payload }, currentState));
    const dispatchValue = action.handler.call(this, dispatchAPI, payload);

    // support Promise
    if (Promise && Promise.resolve) {
      return Promise.resolve(dispatchValue);
    }

    return dispatchValue;
  }

  // exec listeners
  public _execSubscribes(mutation: IPMutationPayload, nextState: S, currentState: S) {
    const listeners = (this._currentListeners = this._nextListeners);
    listeners.forEach(cb => cb(mutation, nextState, currentState));
  }

  private _callDepStoreFN(type: string, payload: IActionPayload | IMutationPayload, opts = {}, FN: 'commit' | 'dispatch') {
    assert(!!type, `${FN} does not exist`);
    const sep = '.';
    const deps = type.split(sep);
    if (deps.length > 1) {
      const sub = deps.pop();
      const store = deps.reduce((x: TDeps<S, G, M, A>, y: string) => {
        // x.$deps for cyclic dependencies
        if (typeof x.$deps === 'function') {
          x.$deps = x.$deps() || {};
        }
        return (x = x.$deps[y]);
      }, this);
      store[FN].call(store, sub, payload, opts);
      return true;
    }
  }

  private _ensureCanMutateNextListeners() {
    if (this._nextListeners === this._currentListeners) {
      this._nextListeners = this._currentListeners.slice();
    }
  }

  private _mapModulePropsTo$Props(module: IModule<S, G, M, A>) {
    mapModulePropsTo$Props(this.$actions, module, 'actions', []);
    mapModulePropsTo$Props(this.$mutations, module, 'mutations', []);
    mapModulePropsTo$Props(this.$getters, module, 'getters', []);
  }
}
