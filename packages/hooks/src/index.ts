export { useHooksComponent as Component } from './Component';
export { useHooksPage as Page } from './Page';

export {
  useLifeCycle,
  createLifeCycle,
  // Page LifeCycle
  useOnLoad,
  useShow,
  useReady,
  useHide,
  useUnload,
  useTitleClick,
  usePullDownRefresh,
  useReachBottom,
  useShareAppMessage,
  // Component LifeCycle
  useOnInit,
  useDeriveDataFromProps,
  useDidMount,
  useDidUpdate,
  useDidUnmount,
} from './hooks/useLifeCycle';

export { useContext } from './hooks/useContext';
export { useEffect, useLayoutEffect } from './hooks/useEffect';
export { useMemo, useCallback } from './hooks/useMemo';
export { useMethods } from './hooks/useMethods';
export { useReducer } from './hooks/useReducer';
export { useRef } from './hooks/useRef';
export { useState } from './hooks/useState';

export { IAction, IMutableRefObject, TAction, TDispatch } from './interface';
