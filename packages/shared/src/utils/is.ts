const TS = Object.prototype.toString;
const OO = '[object Object]';
const OA = '[object Array]';

export function isObject(o: any): boolean {
  return TS.call(o) === OO;
}

export function isArray(o: any): boolean {
  return TS.call(o) === OA;
}

export function isEmpty(value: object): boolean {
  for (const key in value) {
    if (value.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
}

export function isRealObject(o: any): boolean {
  return isObject(o) && !isEmpty(o);
}
