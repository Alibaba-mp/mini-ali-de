// https://github.com/theKashey/use-callback-ref/blob/master/src/useRef.ts

import { IMutableRefObject } from '../interface';
import { useState } from './useState';

/**
 * The same `useRef` but it will callback: 📞 Hello! Your ref was changed!
 * @param initialValue
 * @param callback
 */
export function useRef<T>(initialValue: T | null, callback?: (newValue: T | null, lastValue: T | null) => void): IMutableRefObject<T | null> {
  const [ref] = useState(() => ({
    // last callback
    callback,
    // "memoized" public interface
    facade: {
      get current() {
        return ref.value;
      },
      set current(value) {
        const last = ref.value;
        if (last !== value) {
          ref.value = value;
          if (typeof ref.callback === 'function') {
            ref.callback(value, last);
          }
        }
      },
    },
    // value
    value: initialValue,
  }));

  // update callback
  ref.callback = callback;
  return ref.facade;
}
