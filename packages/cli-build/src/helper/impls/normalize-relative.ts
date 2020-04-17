import { INormalizeRelative } from '../interface';
export const normalizeRelative: INormalizeRelative = (source: string, relative: string) => {
  if (source[0] === '.' || source[0] === '/') {
    return source;
  } else if (relative[0] === '.' || relative[0] === '/') {
    return relative;
  } else {
    return './' + relative;
  }
};
