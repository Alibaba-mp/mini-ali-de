/**
 * https://github.com/pelotom/use-methods
 */
import produce, { PatchListener } from 'immer';
import { useMemo } from './useMemo';
import { useReducer } from './useReducer';

export type StateAndCallbacksFor<M extends MethodsOrOptions> = [StateFor<M>, CallbacksFor<M>];

export type StateFor<M extends MethodsOrOptions> = M extends MethodsOrOptions<infer S, any> ? S : never;

export type CallbacksFor<M extends MethodsOrOptions> = M extends MethodsOrOptions<any, infer R>
  ? {
      [T in ActionUnion<R>['type']]: (...payload: ActionByType<ActionUnion<R>, T>['payload']) => void;
    }
  : never;

export type Methods<S = any, R extends MethodRecordBase<S> = any> = (state: S) => R;

export interface IOptions<S = any, R extends MethodRecordBase<S> = any> {
  methods: Methods<S, R>;
  patchListener?: PatchListener;
}

export type MethodsOrOptions<S = any, R extends MethodRecordBase<S> = any> = Methods<S, R> | IOptions<S, R>;

export type MethodRecordBase<S = any> = Record<string, (...args: any[]) => S extends object ? S | void : S>;

export type ActionUnion<R extends MethodRecordBase> = {
  [T in keyof R]: { type: T; payload: Parameters<R[T]> };
}[keyof R];

export type ActionByType<A, T> = A extends { type: infer T2 } ? (T extends T2 ? A : never) : never;

export function useMethods<S, R extends MethodRecordBase<S>>(
  methodsOrOptions: MethodsOrOptions<S, R>,
  initialState: S
): StateAndCallbacksFor<MethodsOrOptions<S, R>>;
export function useMethods<S, R extends MethodRecordBase<S>, I>(
  methodsOrOptions: MethodsOrOptions<S, R>,
  initializerArg: I,
  initializer: (arg: I) => S
): StateAndCallbacksFor<MethodsOrOptions<S, R>>;
export function useMethods<S, R extends MethodRecordBase<S>>(
  methodsOrOptions: MethodsOrOptions<S, R>,
  initialState: any,
  initializer?: any
): StateAndCallbacksFor<MethodsOrOptions<S, R>> {
  const [reducer, methodsFactory] = useMemo<[(s: S, action: any) => any, Methods<S, R>]>(() => {
    let methods: Methods<S, R>;
    let patchListener: PatchListener | undefined;
    if (typeof methodsOrOptions === 'function') {
      methods = methodsOrOptions;
    } else {
      methods = methodsOrOptions.methods;
      patchListener = methodsOrOptions.patchListener;
    }
    return [
      // tslint:disable-next-line: no-shadowed-variable
      (state: S, action: ActionUnion<R>) => {
        return (produce as any)(state, (draft: S) => methods(draft)[action.type](...action.payload), patchListener);
      },
      methods,
    ];
  }, [methodsOrOptions]);

  const [state, dispatch] = useReducer(reducer, initialState, initializer);

  // const callbacks = useMemo(() => {
  //   const actionTypes: Array<ActionUnion<R>['type']> = Object.keys(methodsFactory(state));
  //   return actionTypes.reduce(
  //     (accum, type) => {
  //       accum[type] = (...payload) => dispatch({ type, payload } as any);
  //       return accum;
  //     },
  //     {} as CallbacksFor<typeof methodsFactory>,
  //   );
  // }, []);

  const actionTypes: Array<ActionUnion<R>['type']> = Object.keys(methodsFactory(state));
  const callbacks = {} as CallbacksFor<typeof methodsFactory>;
  actionTypes.forEach(type => {
    callbacks[type] = (...payload) => dispatch({ type, payload } as any);
  });

  return [state, callbacks];
}
