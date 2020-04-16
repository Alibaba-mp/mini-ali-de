import { appxPathResolver, normalizeRelative } from './impls';
import { IDeBuildHelper } from './interface';

let helper: IDeBuildHelper;

export function setHelperImpl(impl: IDeBuildHelper) {
  helper = impl;
}

export function getHelperImpl() {
  return helper;
}

// TODO: 依赖注入
setHelperImpl({
  appxPathResolver,
  normalizeRelative,
});
