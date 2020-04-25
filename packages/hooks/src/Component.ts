import HookComponent from './Hook';
import { compose, each, isFunction } from './utils';

declare function Component(options: any): void;
declare const my: any;

export function useHooksComponent<S>(create: () => Record<string, any>, initialState?: (() => S) | S, initialProps?: Record<string, any>): void {
  const component2 = my.canIUse('component2');
  let component = new HookComponent(create, valueChange);
  let ctx: any = null;

  function valueChange(newHookValue: any) {
    const state: any = {};
    each(newHookValue, (key: string, value: any) => {
      if (isFunction(value)) {
        ctx[key] = value;
      } else {
        state[key] = value;
      }
    });
    ctx.setData(state);
  }

  function createLifeCycle(life: 'deriveDataFromProps' | 'didUpdate' | 'didUnmount' | 'onInit' | 'didMount') {
    return function(...args: any[]) {
      const hookIds = component.getEmits()[life];
      if (!hookIds) {
        return;
      }
      const lifeFNs = hookIds.map(id => component.hooks[id].fn);
      if (lifeFNs.length) {
        compose(...lifeFNs).call(this, args);
      }
    };
  }

  function createMountLifeCycle(life: 'onInit' | 'didMount') {
    return function() {
      ctx = this;
      if (component) {
        component.setContext(this);
        component.update();
        createLifeCycle(life).call(this);
      }
    };
  }

  Component({
    data: initialState,
    props: initialProps,
    ...(component2
      ? { onInit: createMountLifeCycle('onInit'), deriveDataFromProps: createLifeCycle('deriveDataFromProps') }
      : { didMount: createMountLifeCycle('didMount') }),
    didUpdate: createLifeCycle('didUpdate'),
    didUnmount() {
      if (component) {
        createLifeCycle('didUnmount').call(this);
        component.clean();
        component = null;
      }
    },
  });
}
