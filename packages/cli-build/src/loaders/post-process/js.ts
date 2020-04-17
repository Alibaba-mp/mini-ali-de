import * as babel from '@babel/core';
import traverse from '@babel/traverse';
import { CallExpression, ExportDeclaration, ImportDeclaration } from '@babel/types';
import * as path from 'path';
import { loader } from 'webpack';
import { loadModule } from '../../common';
import { getHelperImpl } from '../../helper';

export async function postJSProcess(context: loader.LoaderContext, ast: babel.ParseResult, jsPath: string, appxRootPath: string) {
  const sourceDirName = path.dirname(jsPath);
  const requests: string[] = [];
  traverse(ast, {
    CallExpression: collectRequestFromCall.bind(null, requests) as any,
    ExportDeclaration: collectRequestFromImportExport.bind(null, requests) as any,
    ImportDeclaration: collectRequestFromImportExport.bind(null, requests) as any,
  });

  const request2Target: Record<string, string> = {};
  for (const request of requests) {
    const helper = getHelperImpl();
    const target = await helper.appxPathResolver(context, appxRootPath, request);
    const pageRelativePath = path.relative(sourceDirName, target);
    await loadModule(context, target);
    request2Target[request] = helper.normalizeRelative(request, pageRelativePath);
  }

  traverse(ast, {
    CallExpression: replaceModulePathFromCall.bind(null, request2Target) as any,
    ExportDeclaration: replaceModulePathFromImportExport.bind(null, request2Target) as any,
    ImportDeclaration: replaceModulePathFromImportExport.bind(null, request2Target) as any,
  });
}

function collectRequestFromCall(requests: string[], nodePath: babel.NodePath<CallExpression>) {
  if (isRequireCall(nodePath)) {
    const source: babel.NodePath<babel.types.StringLiteral> = nodePath.get('arguments.0') as babel.NodePath<babel.types.StringLiteral>;
    requests.push(source.node.value);
  }
}

function collectRequestFromImportExport(
  requests: string[],
  nodePath: babel.NodePath<ImportDeclaration> | babel.NodePath<ExportDeclaration> | any,
  state: babel.Node
) {
  const { node } = nodePath.get('source');
  if (node) {
    requests.push(node.value);
  }
}

function replaceModulePathFromCall(request2Target: Record<string, string>, nodePath: babel.NodePath<CallExpression>) {
  if (isRequireCall(nodePath)) {
    const source: babel.NodePath<babel.types.StringLiteral> = nodePath.get('arguments.0') as babel.NodePath<babel.types.StringLiteral>;
    const target = request2Target[source.node.value];
    if (target) {
      source.replaceWith(babel.types.stringLiteral(target));
    }
  }
}

function replaceModulePathFromImportExport(
  request2Target: Record<string, string>,
  nodePath: babel.NodePath<ImportDeclaration> | babel.NodePath<ExportDeclaration> | any
) {
  const source = nodePath.get('source');
  if (source.node) {
    const target = request2Target[source.node.value];
    if (target) {
      source.replaceWith(babel.types.stringLiteral(target));
    }
  }
}

function isRequireCall(nodePath: babel.NodePath<CallExpression>): boolean {
  const callee = nodePath.get('callee');
  if (callee) {
    const node = callee.node;
    if (babel.types.isIdentifier(node) && !callee.scope.hasBinding('require')) {
      const name = node.name;
      if (name === 'require') {
        return true;
      }
    }
  }
  return false;
}
