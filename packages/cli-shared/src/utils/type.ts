export function typeOf(v: any): string {
  return Object.prototype.toString
    .call(v)
    .replace(/^\[object\s+/, '')
    .replace(/\]$/, '');
}

export type IConstructor<T, K extends any[] = any[]> = new (...args: K) => T;
