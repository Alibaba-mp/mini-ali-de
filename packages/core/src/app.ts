import { Provider } from '@de2/relation';
import { Store } from '@de2/store';
import { TAppOption } from './interface';

declare function App(options: TAppOption<any, any>): void;

export function app<S extends Store<any, any, any, any>>(options: TAppOption<any, S>) {
  const { $store } = options;

  if ($store && ($store as Store<any, any, any, any>).dispatch !== undefined) {
    return App(Provider($store)(options));
  } else {
    return App(options);
  }
}
