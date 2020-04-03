function is(type: string) {
  return (obj: any) => {
    return Object.prototype.toString.call(obj).slice(8, -1) === type;
  };
}

export const isObject = is('Object');
export const isFunction = is('Function');
export const isArray = Array.isArray;
