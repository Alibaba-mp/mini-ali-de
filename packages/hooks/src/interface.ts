export type TDispatch = (action: TAction) => void;

export interface IAction extends Record<string, any> {
  type: string;
}

export type TAction = IAction | string;

export interface IMutableRefObject<T> extends Object {
  current: T;
}

export interface IHooksPageOptions<S> {
  data?: (() => S) | S;
  setup: () => Record<string, any>;
}

export interface IHooksComponentOptions<S> extends IHooksPageOptions<S> {
  props?: Record<string, any>;
}
