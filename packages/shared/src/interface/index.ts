export { IBatch } from './batch';

export interface IDic extends Record<string, any> {}

export interface IWatch<S, G, T> {
  (getter: ((state: S, getters: G) => T) | string, cb: (value: T, oldValue: T) => void, once?: boolean): () => void;
  once: (getter: ((state: S, getters: G) => T) | string, cb: (value: T, oldValue: T) => void) => () => void;
}

export interface IDispatch {
  (type: string, payload?: any, options?: IDispatchOptions): Promise<any>;
  (payloadWithType: IActionPayload, options?: IDispatchOptions): Promise<any>;
}
export interface IDispatchOptions {
  root?: boolean;
}

export interface ICommit<S> {
  (payload: Partial<S>, options?: ICommitOptions): void;
  (type: string, payload?: any, options?: ICommitOptions): void;
  (payloadWithType: IMutationPayload, options?: ICommitOptions): void;
}
export interface ICommitOptions {
  meta?: any;
  root?: boolean;
}

export interface IMutationPayload {
  type?: string;
  [key: string]: any;
}
export interface IActionPayload {
  type: string;
  [key: string]: any;
}

export interface IPMutationPayload {
  type: string;
  payload?: any;
  meta?: any;
}
export interface IPActionPayload {
  type: string;
  payload?: any;
}
