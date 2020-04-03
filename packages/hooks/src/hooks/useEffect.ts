import master from '../master';
import { defer, isFunction } from '../utils';

export function useEffect(create: () => (() => void) | void, deps: any[] | void | null) {
  useEffectImpl(create, deps, true);
}

export function useLayoutEffect(create: () => (() => void) | void, deps: any[] | void | null) {
  useEffectImpl(create, deps);
}

function useEffectImpl(create: () => (() => void) | void, deps: any[] | void | null, defered?: boolean) {
  const component = master.current;
  const hookId = component.getHooksId();
  const hooks = component.getHooks();

  const hook = hooks[hookId];
  // 首次执行
  if (hook === undefined) {
    hooks[hookId] = { deps };
    defer(() => (hooks[hookId].destroy = create()), defered);
    return;
  }

  const mds = hook.deps;
  // 后续执行(无依赖)
  if (!mds || !deps) {
    defer(() => (hook.destroy = create()), defered);
    return;
  }

  // 后续执行(有依赖)，依赖为空数组时 hasChange = false
  const hasChange = !deps.every((v, i) => mds[i] === v);
  if (hasChange) {
    if (isFunction(hook.destroy)) {
      defer(() => hook.destroy(), defered);
    }
    defer(() => (hook.destroy = create()), defered);
    hook.deps = deps;
  }
}
