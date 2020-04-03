import master from './master';
import { ensureArray, isFunction, isObject } from './utils';

export default class Hook {
  public fn: () => Record<string, any>;
  public context: any;
  public hooksId: number;
  public hooks: any[];
  public emits: Record<string, number[]>;
  public subscribes: Array<(newValue: any) => void>;
  public isScheduled: boolean;
  public renderCount: number;
  public isUpdating: boolean;
  constructor(create: () => Record<string, any>, subscribes: (newValue: any) => void) {
    this.fn = create;

    this.context = null;
    this.hooksId = 0;
    this.hooks = [];
    this.emits = {};
    this.subscribes = ensureArray(subscribes);
    this.isScheduled = false;
    this.renderCount = 0;
    this.isUpdating = false;
  }

  public getContext() {
    return this.context;
  }
  public setContext(context: any) {
    this.context = context;
  }
  public getHooksId() {
    return ++this.hooksId;
  }
  public getHooks() {
    return this.hooks;
  }
  public getEmits() {
    return this.emits;
  }

  public run() {
    this.hooksId = 0;
    return this.fn.call(this);
  }

  public update() {
    master.current = this;
    this.isUpdating = true;
    this.isScheduled = true;
    this.renderCount = 0;
    while (this.isScheduled) {
      if (++this.renderCount > 50) {
        throw Error('[de-hooks] too much render');
      }
      this.isScheduled = false;
      const value = this.run();
      this.subscribes.forEach(subs => {
        if (isFunction(subs)) {
          subs.bind(this.context)(value);
        }
      });
    }
    this.isUpdating = false;
    master.current = null;
  }

  public tryUpdate() {
    if (this.isUpdating) {
      this.isScheduled = true;
    } else {
      this.update();
    }
  }

  public clean() {
    const hooks = this.hooks;
    hooks.forEach(hook => {
      if (isObject(hook) && hook.destroy) {
        hook.destroy();
      }
    });
    this.context = null;
    this.hooks = [];
    this.emits = {};
    this.subscribes = [];
  }

  public register(type: string, hookId: number) {
    this.emits[type] = this.emits[type] || [];
    this.emits[type].push(hookId);
  }
  public unregister(type: string, hookId: number) {
    const hookIds = this.emits[type];
    if (hookIds) {
      const index = hookIds.indexOf(hookId);
      if (index !== -1) {
        hookIds.splice(index, 1);
      }
    }
  }
  public notify(type: string, params: any) {
    const subs = this.emits[type];
    ensureArray(subs).forEach(hookId => {
      const hook = this.getHooks()[hookId];
      if (hook && hook.fn && isFunction(hook.fn)) {
        hook.fn(...params);
      }
    });
  }
}
