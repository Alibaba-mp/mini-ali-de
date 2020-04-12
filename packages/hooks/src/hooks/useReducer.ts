import { IAction, TAction, TDispatch } from '../interface';
import { useState } from './useState';

export function useReducer<S, I>(reducer: (state: S, action: TAction, payload?: any) => S, initialState: any, initializer?: (state: I) => S): [S, TDispatch] {
  initialState = typeof initializer === 'function' ? initializer(initialState) : initialState;
  const [state, setState] = useState(initialState);
  const dispatch = (action: TAction, payload?: any) => {
    const ensureAction: IAction = typeof action === 'string' ? { payload, type: action } : action;
    const result = reducer(state, ensureAction);
    setState(result);
  };

  return [state, dispatch];
}
