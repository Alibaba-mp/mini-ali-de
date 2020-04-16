import fs from 'fs';
import json from 'json5';
import path from 'path';
import postcss = require('postcss');
import { loader } from 'webpack';
import { loadModule } from '../../common';
import { getHelperImpl } from '../../helper';

export async function postAcssProcess(context: loader.LoaderContext, ast: postcss.Root, acssPath: string, appxRootPath: string) {
  const sourceDirName = path.dirname(acssPath);
  const sources: string[] = [];
  ast.walkAtRules(atRule => {
    if (atRule.name === 'import') {
      const source = json.parse(atRule.params);
      sources.push(source);
    }
  });

  const sourceToTarget: Record<string, string> = {};
  for (const source of sources) {
    const helper = getHelperImpl();
    const target = await helper.appxPathResolver(context, appxRootPath, source, 'acss');
    const pageRelativePath = path.relative(sourceDirName, target);
    sourceToTarget[source] = helper.normalizeRelative(source, pageRelativePath);
    context.addDependency(target);
    await loadModule(context, target);
  }

  ast.walkAtRules(atRule => {
    if (atRule.name === 'import') {
      const target = sourceToTarget[json.parse(atRule.params)];
      atRule.params = json.stringify(target);
    }
  });

  return ast;
}
