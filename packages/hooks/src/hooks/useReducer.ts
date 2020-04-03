import { IAction, TDispatch } from '../interface';
import { useState } from './useState';

export function useReducer<S, I>(reducer: (state: S, action: IAction) => S, initialState: any, initializer?: (state: I) => S): [S, TDispatch] {
  initialState = typeof initializer === 'function' ? initializer(initialState) : initialState;
  const [state, setState] = useState(initialState);
  const dispatch = (action: IAction) => {
    const result = reducer(state, action);
    setState(result);
  };

  return [state, dispatch];
}
