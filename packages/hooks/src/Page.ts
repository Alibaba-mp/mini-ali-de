import HookComponent from './Hook';
import { IHooksPageOptions } from './interface';
import { compose, each, isFunction } from './utils';

declare function Page(options: any): void;
declare const my: any;

export function useHooksPage(options: IHooksPageOptions<Record<string, any>> | (() => Record<string, any>)): void {
  if (typeof options === 'function') {
    options = { setup: options };
  }

  const { data = {} } = options;
  let component = new HookComponent(options, valueChange);
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

  type TLifeCycle = 'onShow' | 'onLoad' | 'onReady' | 'onHide' | 'onTitleClick' | 'onPullDownRefresh' | 'onReachBottom' | 'onShareAppMessage' | 'onUnload';

  function createLifeCycle(life: TLifeCycle) {
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

  Page({
    data,
    onShow: createLifeCycle('onShow'),
    onHide: createLifeCycle('onHide'),
    onPullDownRefresh: createLifeCycle('onPullDownRefresh'),
    onReachBottom: createLifeCycle('onReachBottom'),
    onReady: createLifeCycle('onReady'),
    onShareAppMessage: createLifeCycle('onShareAppMessage'),
    onTitleClick: createLifeCycle('onTitleClick'),
    onLoad() {
      ctx = this;
      if (component) {
        component.setContext(this);
        component.update();
        createLifeCycle('onLoad').call(this);
      }
    },
    onUnload() {
      if (component) {
        createLifeCycle('onUnload').call(this);
        component.clean();
        component = null;
      }
    },
  });
}
