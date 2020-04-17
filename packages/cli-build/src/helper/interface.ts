import { loader } from 'webpack';

export type IAppXPathResolver = (
  context: loader.LoaderContext, // 当前json文件的地址，绝对路径
  appxRootPath: string, // 小程序的根目录，绝对路径
  request: string, // 请求的路径
  type?: 'page' | 'component' | 'acss' | 'axml' | 'js' | 'sjs' // 是页面请求还是组件请求
) => Promise<string>;

export type INormalizeRelative = (source: string, relativeTarget: string) => string;

export interface IDeBuildHelper {
  appxPathResolver: IAppXPathResolver;
  normalizeRelative: INormalizeRelative;
}
