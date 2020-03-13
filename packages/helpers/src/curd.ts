import { IDic } from '@de/shared';

enum Methods {
  GET = 'get',
  SET = 'set',
  DELETE = 'delete',
  UPDATE = 'update',
}

function curd(method: Methods, target: IDic, path: string | string[], value?: any) {
  let context: string[];
  if (Array.isArray(path)) {
    context = path;
  } else if (typeof path === 'string') {
    if (path.indexOf('.') === -1 && path.indexOf('[') === -1) {
      if (method === 'get') {
        return target[path];
      }
      target[path] = value;
    }
    context = path.split(/\.|\[|\]/g).filter(item => !!item);
  }
  const len = context.length;

  return context.reduce((target, cProps, index) => {
    if (!target) {
      return;
    }

    if (method === 'update' && !target.hasOwnProperty(cProps)) {
      return;
    }

    if (index === len - 1) {
      switch (method) {
        case 'delete':
          Array.isArray(target) ? target.splice(+cProps, 1) : delete target[cProps];
          break;

        case 'set':
        case 'update':
          target[cProps] = value;
          break;
        default:
          break;
      }
    }

    if (method === 'set' && target[cProps] === undefined) {
      target[cProps] = {};
    }

    return target[cProps];
  }, target);
}

export function setIn(target: IDic, path: string | string[], value: any) {
  return curd(Methods.SET, target, path, value);
}

export function getIn(target: IDic, path: string | string[]) {
  return curd(Methods.GET, target, path);
}

export function deleteIn(target: IDic, path: string | string[]) {
  return curd(Methods.DELETE, target, path);
}

export function updateIn(target: IDic, path: string | string[], value: any) {
  return curd(Methods.UPDATE, target, path, value);
}
