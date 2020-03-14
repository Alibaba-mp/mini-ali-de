import { IDic, IPMutationPayload } from '@de2/shared';
import { Store, TPlugin } from '@de2/store';

interface IEStore extends Store<any, any, any, any> {
  $setDataHook?: (...args: any[]) => any;
}
interface ILoggerOptions {
  predicate: (mutation: IPMutationPayload, newState: IDic, oldState: IDic) => any;
  collapsed?: boolean;
}

// 容错一下，cube 没有 console.groupXXX
console.groupCollapsed = console.groupCollapsed || console.log;
console.groupEnd = console.groupEnd || console.log;
console.group = console.group || console.log;

export function createLogger(options: ILoggerOptions = { predicate: () => true, collapsed: true }): TPlugin<any, any, any, any> {
  const predicate = options.predicate;
  const collapsed = options.collapsed;

  console.groupCollapsed = collapsed ? console.groupCollapsed : console.group;

  return (store: Store<any, any, any, any>) => {
    let prevState = store.getState();
    store.subscribe((mutation: IPMutationPayload, newState: IDic, oldState: IDic) => {
      if (typeof predicate === 'function' && !predicate(mutation, newState, oldState)) {
        return;
      }

      const formatTime = getNowFormatTime();
      console.groupCollapsed(`@@De/mutation: ${mutation.type}${formatTime}`);
      console.log('%c payload: ', 'color: #03A9F4;', mutation.payload);
      console.log('%c prevState: ', 'color: #9E9E9E;', prevState);
      const nextState = store.getState();
      console.log('%c nextState: ', 'color: #4CAF50;', nextState);
      console.groupEnd();
      prevState = nextState;
    });
  };
}

export function createLoggerMiddleware({ predicate = (mutation: any, payload: any, ...args: any[]) => true, collapsed = true } = {}): TPlugin<
  any,
  any,
  any,
  any
> {
  console.groupCollapsed = collapsed ? console.groupCollapsed : console.group;

  return (store: Store<any, any, any, any>) => (next: (...args: any[]) => any) => (mutation: any, payload: any, ...args: any[]) => {
    if (!predicate(mutation, payload, ...args)) {
      next(mutation, payload, ...args);
      return;
    }

    const formatTime = getNowFormatTime();
    console.groupCollapsed(`@@De/mutation: ${mutation}${formatTime}`);
    console.log('%c payload: ', 'color: #03A9F4', payload);
    console.log('%c prevState: ', 'color: #9E9E9E', store.getState());
    next(mutation, payload);
    console.log('%c nextState: ', 'color: #4CAF50', store.getState());
    console.groupEnd();
  };
}

export function createSetDataLogger({ predicate = (mutation: IPMutationPayload, context: IDic) => true, collapsed = true } = {}): TPlugin<any, any, any, any> {
  console.groupCollapsed = collapsed ? console.groupCollapsed : console.group;

  return (store: IEStore) => {
    store.$setDataHook = ({ context, nextData, mutation, diff }, isSpliceData) => {
      if (typeof predicate === 'function' && !predicate(mutation, context)) {
        return;
      }

      const formatTime = getNowFormatTime();
      const setDataPos = context.$viewId ? ` @ page ${context.$viewId}` : ` @ component ${context.$id}`;

      if (!mutation) {
        console.groupCollapsed(`%c@@De/warn setData not by commit: ${formatTime}${setDataPos}`, 'color: #846A3A;background: #FFFBE6');
        console.warn('@@De/warn: setData/$spliceData not by commit');
        console.log('%c context: ', 'color: #03A9F4;', context);
        console.log('%c prevData: ', 'color: #9E9E9E;', context.data);
        console.log('%c nextData: ', 'color: #4CAF50;', nextData);
        console.log('%c setDataDiff: ', 'color: #4CAF50;', diff);
        console.groupEnd();
        return;
      }

      console.groupCollapsed(
        `%c@@De/${isSpliceData ? 'spliceDataHook' : 'setDataHook'} by mutation: ${mutation.type}${formatTime}${setDataPos}`,
        'color: #4CAF50;'
      );
      console.log('%c context: ', 'color: #03A9F4;', context);
      console.log('%c payload: ', 'color: #03A9F4;', mutation.payload);
      if (isSpliceData) {
        const meta = mutation.meta;
        console.log('%c splicePath: ', 'color: #9E9E9E;', meta.splicePath);
        console.log('%c spliceData: ', 'color: #4CAF50;', meta.spliceData);
      } else {
        console.log('%c prevData: ', 'color: #9E9E9E;', context.data);
        console.log('%c nextData: ', 'color: #4CAF50;', nextData);
        console.log('%c setDataDiff: ', 'color: #4CAF50;', diff);
      }
      console.groupEnd();
    };
  };
}

function getNowFormatTime() {
  const time = new Date();
  const formattedTime = ` @ ${pad(time.getHours(), 2)}:${pad(time.getMinutes(), 2)}:${pad(time.getSeconds(), 2)}.${pad(time.getMilliseconds(), 3)}`;
  return formattedTime;
}

function pad(num: number, maxLength: number) {
  const repeat = (str: string, times: number) => new Array(times + 1).join(str);
  return repeat('0', maxLength - num.toString().length) + num;
}
