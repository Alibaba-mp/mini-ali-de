export function ensureArray(arr: any) {
  if (arr === undefined || arr === null) {
    return [];
  }
  return Array.isArray(arr) ? arr : [arr];
}

export function each(obj: any[] | Record<string, any>, fn: (index: number | string, value: any) => void) {
  if (Array.isArray(obj)) {
    obj.forEach((value: any, index: number) => fn(index, value));
  } else {
    Object.keys(obj).forEach((key: string) => fn && fn(key, obj[key]));
  }
}

export { isArray, isFunction, isObject } from './type';
export { compose } from './compose';
export { defer } from './defer';
export { is } from './is';
