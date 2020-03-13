import { setIn } from '@de/helpers';
import { IDic } from '@de/shared';
import { IInnerActionTree, IInnerGetterTree, IInnerMutationTree, IModule } from './interface';

export function argcAdapter(_type: any, _payload: any, _opts: any = {}) {
  if (typeof _type === 'object') {
    const { type, ...payload } = _type;
    const opts = _payload || {};
    return { type, payload, opts };
  }
  return { type: _type, payload: _payload, opts: _opts };
}

// throw assert
export function assert(condition: boolean, msg: string) {
  if (!condition) {
    const errorMsg = '[@@De] ' + msg;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
}

export function warn(condition: boolean, msg: string) {
  if (!condition) {
    console.warn('[@@De] ' + msg);
  }
}

// extract state from module
export function extractState<S, G, M, A>(module: IModule<S, G, M, A>) {
  const mstate = module.state || {};
  const state = typeof mstate === 'function' ? mstate() : mstate;
  const subModule = module.modules;
  if (!subModule) {
    return state;
  }
  Object.keys(subModule).forEach(item => (state[item] = extractState(subModule[item])));
  return state;
}

// get value from state by the context path
export function getStateByContext(state: IDic, context: string[]) {
  return context.length ? context.reduce((state, key) => state[key], state) : state;
}

// extract mutations and actions from module to $action and $mutations
export function mapModulePropsTo$Props<S, G, M, A>(
  map: IInnerActionTree<S, G, M, A> | IInnerMutationTree<S, G, M, A> | IInnerGetterTree<S, G, M, A>,
  module: IModule<S, G, M, A>,
  type: 'actions' | 'mutations' | 'getters',
  context: string[]
) {
  const sep = '/';
  let props: any = module[type];

  if (type === 'mutations') {
    props = props || {};
    props['@@DeUpdateView'] = (state: Partial<S>, payload: any) => {
      Object.keys(payload).forEach(item => {
        setIn(state, item, payload[item]);
      });
    };
  }

  if (props) {
    Object.keys(props).forEach(name => {
      const $prop = { name, context, handler: props[name] };
      if (context.length) {
        map[`${context.join(sep)}${sep}${name}`] = $prop;
      } else {
        map[name] = $prop;
      }
    });
  }

  const subModule = module.modules;
  if (!subModule) {
    return;
  }
  Object.keys(subModule).forEach(key => mapModulePropsTo$Props(map, subModule[key], type, context.concat(key)));
}
