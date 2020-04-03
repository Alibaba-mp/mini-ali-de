import master from '../master';

type TLifeCycle =
  | 'onLoad'
  | 'onShow'
  | 'onReady'
  | 'onHide'
  | 'onTitleClick'
  | 'onPullDownRefresh'
  | 'onReachBottom'
  | 'onShareAppMessage'
  | 'onUnload'
  | 'onInit'
  | 'deriveDataFromProps'
  | 'didMount'
  | 'didUpdate'
  | 'didUnmount';

export function useLifeCycle(lifeCycleName: TLifeCycle, callback: (...args: any[]) => any) {
  const component = master.current;
  const hookId = component.getHooksId();
  const hooks = component.getHooks();

  if (!hooks[hookId]) {
    hooks[hookId] = {
      fn: callback,
    };
    component.register(lifeCycleName, hookId);
  }

  return () => {
    component.unregister(lifeCycleName, hookId);
  };
}

export function createLifeCycle(name: TLifeCycle) {
  return (callback: (...args: any[]) => any) => {
    useLifeCycle(name, callback);
  };
}

// page lifeCycle
export const useOnLoad = createLifeCycle('onLoad');
export const useShow = createLifeCycle('onShow');
export const useReady = createLifeCycle('onReady');
export const useHide = createLifeCycle('onHide');
export const useUnload = createLifeCycle('onUnload');
export const useTitleClick = createLifeCycle('onTitleClick');
export const usePullDownRefresh = createLifeCycle('onPullDownRefresh');
export const useReachBottom = createLifeCycle('onReachBottom');
export const useShareAppMessage = createLifeCycle('onShareAppMessage');

// component lifeCycle
export const useOnInit = createLifeCycle('onInit');
export const useDeriveDataFromProps = createLifeCycle('deriveDataFromProps');
export const useDidMount = createLifeCycle('didMount');
export const useDidUpdate = createLifeCycle('didUpdate');
export const useDidUnmount = createLifeCycle('didUnmount');
