import { IDic, isArray, isEmpty, isObject } from '@de2/shared';

export function flatDeepDiff(prev: IDic, next: IDic) {
  if (!isObject(prev) || !isObject(next)) {
    throw new TypeError('parameter must be object');
  }

  const flatDiff: IDic = {};
  const initPath = '';
  fillKeys(prev, next, initPath, flatDiff);
  deepDiff(prev, next, initPath, flatDiff);

  if (isEmpty(flatDiff)) {
    return null;
  }

  // {}, { a: 'x' } => { '': { a: 'x' } }
  if (flatDiff[''] !== undefined) {
    return flatDiff[''];
  }
  return flatDiff;
}

function deepDiff(prev: any, next: any, path: string, flatDiff: IDic) {
  if (prev === next) {
    return;
  }
  const isOO = isObject(prev) && isObject(next);
  const isOA = isArray(prev) && isArray(next);

  if (isOO) {
    if (isEmpty(prev) /* && path.length */) {
      if (!isEmpty(next)) {
        flatDiff[path] = next;
      }
    } else {
      for (const key in next) {
        if (next.hasOwnProperty(key)) {
          // 第一层数据是$t(语言数据)的话跳过fill
          if (path === '' && (key === '$t' || key === '$tg')) {
            continue;
          }
          const flatKey = path + (path.length ? '.' + key : key);
          const nValue = next[key] !== undefined ? next[key] : null;
          const pValue = prev[key];
          if (!isObject(nValue) && !isArray(nValue)) {
            if (nValue !== pValue) {
              flatDiff[flatKey] = nValue;
            }
          } else if (isArray(nValue)) {
            if (!isArray(pValue) || nValue.length < pValue.length) {
              flatDiff[flatKey] = nValue;
            } else {
              deepDiff(pValue, nValue, flatKey, flatDiff);
              // nValue.forEach((item, idx) => {
              //   deepDiff(pValue[idx], item, flatKey + '[' + idx + ']', flatDiff);
              // });
            }
          } else if (isObject(nValue)) {
            if (!isObject(pValue)) {
              flatDiff[flatKey] = nValue;
            } else {
              deepDiff(pValue, nValue, flatKey, flatDiff);
              // for (var sk in nValue) {
              //   deepDiff(pValue[sk], nValue[sk], flatKey + '.' + sk, flatDiff);
              // }
            }
          }
        }
      }
    }
  } else if (isOA && next.length >= prev.length) {
    /**
     * nextData 的数组长度小于 prevData 的数组长度的时候，不做数组 deepDiff，这种情况尽量采用 $spliceData
     * 删除数组中一项:
     * commit(type, payload, {
     *  meta: {
     *     splicePath: 'path', // eg. 'todos'
     *     spliceData: [start, deleteCount, ...items] // eg. [100, 1]
     *   }
     * });
     */
    next.forEach((item: any, idx: number) => {
      deepDiff(prev[idx], item, path + '[' + idx + ']', flatDiff);
    });
  } else {
    flatDiff[path] = next;
  }

  return flatDiff;
}

/**
 * 把 prevData 中存在但 nextData 中不存在的 key 赋值 null, 包括数组中的对象
 *
 * { a: 1, b: 2 }, { a: 1 } => { a: 1, b: 2 }, { a: 1, b: null }
 */
function fillKeys(prev: any, next: any, path: string, flatDiff: IDic) {
  if (prev === next) {
    return;
  }
  const isOO = isObject(prev) && isObject(next);
  const isOA = isArray(prev) && isArray(next);

  if (isOO) {
    for (const key in prev) {
      if (prev.hasOwnProperty(key)) {
        // 第一层数据是$t(语言数据)的话跳过fill
        if (path === '' && (key === '$t' || key === '$tg')) {
          continue;
        }
        const flatKey = path + (path.length ? '.' + key : key);
        if (next[key] === undefined && prev[key] !== undefined && prev[key] !== null) {
          flatDiff[flatKey] = null;
        } else {
          fillKeys(prev[key], next[key], flatKey, flatDiff);
        }
      }
    }
  } else if (isOA && next.length >= prev.length) {
    next.forEach((item: any, idx: number) => {
      fillKeys(prev[idx], item, path + '[' + idx + ']', flatDiff);
    });
  }
}
