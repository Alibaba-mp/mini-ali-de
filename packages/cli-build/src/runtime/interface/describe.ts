import * as babel from '@babel/core';
import { MarkupNode, MiniNode } from '@de2/compiler';
import postcss from 'postcss';

export interface IDeBuildPluginFile {
  readonly filePath: string;
  readonly fileContent: string;
}

export interface IDeBuildPluginAST<T> extends IDeBuildPluginFile {
  ast: T;
}

export type TDeBuildPluginFile4ACSS = IDeBuildPluginAST<postcss.Root>;
export type TDeBuildPluginFile4JS = IDeBuildPluginAST<babel.ParseResult>;
export type TDeBuildPluginFile4JSON = IDeBuildPluginAST<any>;
export type TDeBuildPluginFile4AXML = IDeBuildPluginAST<MarkupNode>;

export interface IDeBuildPluginComponentDescribe {
  componentPath: string;
  acssFile?: TDeBuildPluginFile4ACSS;
  jsFile?: TDeBuildPluginFile4JS;
  jsonFile?: TDeBuildPluginFile4JSON;
  axmlFile?: TDeBuildPluginFile4AXML;
}

export interface IDeBuildPluginPageDescribe {
  pagePath: string;
  acssFile?: TDeBuildPluginFile4ACSS;
  jsFile?: TDeBuildPluginFile4JS;
  jsonFile?: TDeBuildPluginFile4JSON;
  axmlFile?: TDeBuildPluginFile4AXML;
}

export interface IDeBuildPluginAppDescribe {
  acssFile?: TDeBuildPluginFile4ACSS;
  jsFile?: TDeBuildPluginFile4JS;
  jsonFile?: TDeBuildPluginFile4JSON;
}

export interface IDeBuildPlugin<T = any> {
  /**
   * @TODO 差个类型
   */
  init(config: T): void;
  /**
   * 处理页面
   * @param pagePath
   * @param pageDescribe
   */
  processPage(pageDescribe: IDeBuildPluginPageDescribe): Promise<IDeBuildPluginPageDescribe>;
  /**
   * 处理 app
   * @param appDescribe
   */
  processApp(appDescribe: IDeBuildPluginAppDescribe): Promise<IDeBuildPluginAppDescribe>;
  /**
   * 处理组件
   * @param componentDescribe
   */
  processComponent(componentDescribe: IDeBuildPluginComponentDescribe): Promise<IDeBuildPluginComponentDescribe>;
  /**
   * 处理独立的 js 文件
   * @param jsFile
   */
  processExtraJS(jsFile: TDeBuildPluginFile4JS): Promise<TDeBuildPluginFile4JS>;
  /**
   * template include 引入的
   * 处理独立的 AXML 文件
   * @param axmlFile
   */
  processExtraAXML(axmlFile: TDeBuildPluginFile4AXML): Promise<TDeBuildPluginFile4AXML>;
  /**
   * 处理独立的 acss 文件
   * @param styleFile
   */
  processExtraACSS(acssFile: TDeBuildPluginFile4ACSS): Promise<TDeBuildPluginFile4ACSS>;
}
