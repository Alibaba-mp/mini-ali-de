export type IConstructor<T, K extends any[] = []> = new (...args: K) => T;
