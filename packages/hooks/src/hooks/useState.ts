import master from '../master';
import { is } from '../utils';

export function useState<S>(initialState: (() => S) | S): [S, (newStateOrStateTransformer: ((state: S) => S) | S) => void] {
  const component = master.current;
  const hookId = component.getHooksId();
  const hooks = component.getHooks();
  const context = component.getContext();

  function setState(newStateOrStateTransformer: any) {
    const hook = hooks[hookId];
    const oldState = hook[2];
    const newState = typeof newStateOrStateTransformer === 'function' ? newStateOrStateTransformer(hook[2]) : newStateOrStateTransformer;
    if (!is(newState, oldState)) {
      hook[2] = newState;
      component.tryUpdate();
    }
  }

  if (!hooks[hookId]) {
    initialState = typeof initialState === 'function' ? initialState.call(context) : initialState;
    hooks[hookId] = [initialState, setState, initialState];
  }

  const hook = hooks[hookId];
  hook[0] = hook[2];
  return hook;
}
