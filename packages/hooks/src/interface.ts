export type TDispatch = (action: IAction) => void;

export interface IAction extends Record<string, any> {
  type: string;
}

export interface IMutableRefObject<T> extends Object {
  current: T;
}
