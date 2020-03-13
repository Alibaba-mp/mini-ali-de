import { getIn } from '@de/helpers';
import { IDic, IPMutationPayload } from '@de/shared';
import { warn } from './helper';
import { Store } from './store';

// built-in plugin
export function watch(store: Store<any, any, any, any>) {
  function watchInner<T>(getState: () => T, path?: string) {
    let currentValue = path ? getIn(getState(), path) : getState();
    return (onChange: (value: T, oldValue: T) => void) => () => {
      const newValue = path ? getIn(getState(), path) : getState();
      if (currentValue !== newValue) {
        const oldValue = currentValue;
        currentValue = newValue;
        onChange(newValue, oldValue);
      }
    };
  }
  function watchWithOnce<T>(pathOrSelector: ((state: IDic, getters: any) => T) | string, onChange: (value: T, oldValue: T) => void, once?: boolean) {
    if (typeof onChange !== 'function') {
      warn(false, 'watch need a change handler');
      return;
    }
    let w;
    if (typeof pathOrSelector === 'function') {
      w = watchInner(() => pathOrSelector(store.getState(), store.getters));
    } else {
      // store.watch('moduleA/propsB.subPropsC')
      // store.watch('moduleA.propsB.subPropsC')
      const alias = pathOrSelector.replace('/', '.');
      w = watchInner(() => store.getState(), alias);
    }

    const unsubscribe = store.subscribe(
      w((value: T, oldValue: T) => {
        onChange(value, oldValue);
        if (once) {
          unsubscribe();
        }
      })
    );

    if (once) {
      return () => {
        warn(false, 'watch once no need to unwatch');
        return true;
      };
    }
    return unsubscribe;
  }
  watchWithOnce.once = <T>(pathOrSelector: ((state: IDic, getters: any) => T) | string, onChange: (value: T, oldValue: T) => void) => {
    return store.watch(pathOrSelector, onChange, true);
  };

  store.watch = watchWithOnce;
  store.when = <T>(predicate: (state: IDic) => boolean, effect: (mutation: IPMutationPayload, state: T, oldValue: T) => any) => {
    return store.subscribe((mutation: IPMutationPayload, newState: T, oldState: T) => {
      if (predicate(newState)) {
        effect(mutation, newState, oldState);
      }
    });
  };

  return store;
}
