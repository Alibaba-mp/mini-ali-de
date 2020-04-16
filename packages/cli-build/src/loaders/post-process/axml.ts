import { isMarkupElement, MarkupElement, MarkupNode, MiniNodeTraverser, walk } from '@de2/compiler';
import { resolveSrv } from 'dns';
import fs from 'fs';
import path from 'path';
import util from 'util';
import { loader } from 'webpack';
import { loadModule } from '../../common';
import { getHelperImpl } from '../../helper';

export async function postAXMLProcess(context: loader.LoaderContext, ast: MarkupNode, axmlPath: string, appxRootPath: string) {
  const sourceDirName = path.dirname(axmlPath);
  const pre = new PreAXMLMarkupTraverser(ast);
  pre.walk();
  const axmlResources = [...pre.getImportAxml(), ...pre.getIncludeAxml()];
  const sjsResources = pre.getImportSjs();

  const axmlResources2Target: Record<string, string> = {};
  for (const source of axmlResources) {
    const helper = getHelperImpl();
    const target = await helper.appxPathResolver(context, appxRootPath, source, 'axml');
    const pageRelativePath = path.relative(sourceDirName, target);
    axmlResources2Target[source] = helper.normalizeRelative(source, pageRelativePath);
    context.addDependency(target);
    await loadModule(context, target);
  }

  const sjsResources2Target: Record<string, string> = {};
  for (const source of sjsResources) {
    const helper = getHelperImpl();
    const target = await helper.appxPathResolver(context, appxRootPath, source, 'sjs');
    const pageRelativePath = path.relative(sourceDirName, target);
    sjsResources2Target[source] = helper.normalizeRelative(source, pageRelativePath);
    context.addDependency(target);
    await loadModule(context, target);
  }

  const post = new PostAXMLTraverser(ast, axmlResources2Target, sjsResources2Target);
  post.walk();
}

class PreAXMLMarkupTraverser {
  private root: MarkupNode;
  private importAxmlSet: Set<string> = new Set();
  private includeAxmlSet: Set<string> = new Set();
  private importSjsSet: Set<string> = new Set();
  public constructor(root: MarkupNode) {
    this.root = root;
  }
  public walk() {
    walk(this.root, (node: MarkupNode, parentNode: MarkupNode) => {
      if (isMarkupElement(node)) {
        const tagName = node.tagName;
        if (tagName === 'import') {
          this.processImportTemplate(node);
        } else if (tagName === 'import-sjs') {
          this.processImportSjs(node);
        } else if (tagName === 'include') {
          this.processIncludeTemplate(node);
        }
      }
    });
  }
  public getImportAxml() {
    return Array.from(this.importAxmlSet);
  }
  public getIncludeAxml() {
    return Array.from(this.includeAxmlSet);
  }
  public getImportSjs() {
    return Array.from(this.importSjsSet);
  }
  private processImportTemplate(node: MarkupElement) {
    const src = node.getAttribute('src');
    if (src) {
      this.importAxmlSet.add(src.value.rawValue);
    }
  }
  private processIncludeTemplate(node: MarkupElement) {
    const src = node.getAttribute('src');
    if (src) {
      this.includeAxmlSet.add(src.value.rawValue);
    }
  }
  private processImportSjs(node: MarkupElement) {
    const src = node.getAttribute('from');
    if (src) {
      this.importSjsSet.add(src.value.rawValue);
    }
  }
}

// tslint:disable max-classes-per-file
class PostAXMLTraverser {
  private root: MarkupNode;
  private axmlResource2Target: Record<string, string>;
  private sjsResource2Target: Record<string, string>;
  public constructor(root: MarkupNode, axmlResource2Target: Record<string, string>, sjsResource2Target: Record<string, string>) {
    this.root = root;
    this.axmlResource2Target = axmlResource2Target;
    this.sjsResource2Target = sjsResource2Target;
  }
  public walk() {
    walk(this.root, (node: MarkupNode, parentNode: MarkupNode) => {
      if (isMarkupElement(node)) {
        const tagName = node.tagName;
        if (tagName === 'import') {
          this.processImportTemplate(node);
        } else if (tagName === 'import-sjs') {
          this.processImportSjs(node);
        } else if (tagName === 'include') {
          this.processIncludeTemplate(node);
        }
      }
    });
  }
  private processImportTemplate(node: MarkupElement) {
    const src = node.getAttribute('src');
    if (src) {
      const resource = src.value.rawValue;
      src.value.toValue(this.axmlResource2Target[resource]);
    }
  }
  private processIncludeTemplate(node: MarkupElement) {
    const src = node.getAttribute('src');
    if (src) {
      const resource = src.value.rawValue;
      src.value.toValue(this.axmlResource2Target[resource]);
    }
  }
  private processImportSjs(node: MarkupElement) {
    const src = node.getAttribute('from');
    if (src) {
      const resource = src.value.rawValue;
      src.value.toValue(this.sjsResource2Target[resource]);
    }
  }
}
