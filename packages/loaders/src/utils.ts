import debug from 'debug';

// tslint:disable-next-line:no-var-requires
const pkg = require('../package.json');

debug.enable(pkg.name);

export const log = debug(pkg.name);

export function isPromise(obj: any) {
  return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
}
