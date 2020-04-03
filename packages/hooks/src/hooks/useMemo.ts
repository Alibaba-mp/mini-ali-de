import master from '../master';

export function useMemo<T>(create: () => T, deps: any[] | void | null): T {
  const component = master.current;
  const hookId = component.getHooksId();
  const hooks = component.getHooks();
  const memory = hooks[hookId];
  let memo = memory && memory.memo;

  // 首次执行
  if (memory === undefined) {
    memo = create();
    hooks[hookId] = { deps, memo };
    return memo;
  }

  const mds = memory.deps;
  // 后续执行(无依赖，每次都执行)
  if (!mds || !deps) {
    memo = create();
    memory.memo = memo;
    return memo;
  }

  // 后续执行(有依赖，依赖为空数组时 hasChange = false，保证只执行一次）
  const hasChange = !deps.every((v, i) => mds[i] === v);
  if (hasChange) {
    memo = create();
    memory.memo = memo;
    memory.deps = deps;
  }

  return memo;
}

export function useCallback<T>(callback: T, deps: any[] | void | null): T {
  return useMemo(() => callback, deps);
}
