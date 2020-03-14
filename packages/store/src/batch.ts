import { IBatch } from '@de2/shared';
import { Store } from './Store';

export function batch(store: Store<any, any, any, any>, batch: IBatch | boolean) {
  if (!batch) {
    return store;
  }

  let timestep = 16;
  if (typeof batch === 'object' && typeof batch.timestep === 'number') {
    timestep = batch.timestep;
  }
  const batchFN = debounce(n => n(), +timestep);
  const oldExecSubscribes = store._execSubscribes.bind(store);

  const batchExecSubscribes = (...args: any[]) => batchFN(() => oldExecSubscribes(...args));

  // Intercept exec subscribes
  store._execSubscribes = batchExecSubscribes;

  // Retain immediate commit
  store.commitIM = (type: any, payload, opts) => {
    store._execSubscribes = oldExecSubscribes;
    store.commit(type, payload, opts);
    store._execSubscribes = batchExecSubscribes;
  };

  return store;
}

function debounce(fn: (n: () => void) => any, delay: number) {
  let timer: any = null;
  return (...args: any[]) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => fn.apply(null, args), delay);
  };
}
