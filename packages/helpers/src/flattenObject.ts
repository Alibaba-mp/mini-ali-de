import { IDic, isObject } from '@de2/shared';

export function flattenObject(obj: IDic): IDic {
  function iterator(obj: IDic, prefix: string = '', flattened: IDic = {}) {
    Object.keys(obj).forEach(key => {
      const val = obj[key];

      if (isObject(val)) {
        iterator(val, prefix + key + '.', flattened);
        return;
      }
      flattened[prefix + key] = val;
    });

    return flattened;
  }

  return iterator(obj);
}
