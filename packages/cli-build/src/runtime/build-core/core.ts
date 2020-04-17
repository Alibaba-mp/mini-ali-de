import { acssGenerate, axmlGenerate, jsGenerator } from '../codegen';
import {
  IDeBuildPlugin,
  IDeBuildPluginAppDescribe,
  IDeBuildPluginComponentDescribe,
  IDeBuildPluginFile,
  IDeBuildPluginPageDescribe,
  TDeBuildPluginFile4ACSS,
  TDeBuildPluginFile4AXML,
  TDeBuildPluginFile4JS,
} from '../interface';
import { acssParse, axmlParse, jsonParse, jsParse } from '../parser';

interface IAppMeta4DeBuild {
  appJSON: IDeBuildPluginFile;
  appJS: IDeBuildPluginFile;
  appACSS: IDeBuildPluginFile;
}

interface IPageMeta4DeBuild {
  pagePath: string;
  pageJSON?: IDeBuildPluginFile;
  pageJS?: IDeBuildPluginFile;
  pageACSS?: IDeBuildPluginFile;
  pageAXML?: IDeBuildPluginFile;
}

interface IComponentMeta4DeBuild {
  componentPath: string;
  componentAXML?: IDeBuildPluginFile;
  componentJSON?: IDeBuildPluginFile;
  componentJS?: IDeBuildPluginFile;
  componentACSS?: IDeBuildPluginFile;
}

export class DeBuildCoreRuntime {
  private plugins: IDeBuildPlugin[] = [];
  private appxRootPath: string;
  public init(plugins: IDeBuildPlugin[], appxRootPath: string) {
    this.plugins = plugins;
    this.appxRootPath = appxRootPath;
  }
  public async invoke4ExtraAxml(extraAXML: IDeBuildPluginFile) {
    let axmlDescribe = await this.buildDescribe4ExtraAXML(extraAXML);
    for (const plugin of this.plugins) {
      if (plugin.processExtraAXML) {
        axmlDescribe = await plugin.processExtraAXML(axmlDescribe);
      }
    }
    return axmlDescribe;
  }
  public async invoke4ExtraJS(extraJS: IDeBuildPluginFile) {
    let jsDescribe = await this.buildDescribe4ExtraJS(extraJS);
    for (const plugin of this.plugins) {
      if (plugin.processExtraJS) {
        jsDescribe = await plugin.processExtraJS(jsDescribe);
      }
    }
    return jsDescribe;
  }
  public async invoke4ExtraACSS(extraACSS: IDeBuildPluginFile) {
    let acssDescribe = await this.buildDescribe4ExtraACSS(extraACSS);
    for (const plugin of this.plugins) {
      if (plugin.processExtraACSS) {
        acssDescribe = await plugin.processExtraACSS(acssDescribe);
      }
    }
    return acssDescribe;
  }
  public async invoke4Page(pageMeta: IPageMeta4DeBuild) {
    let pageDescribe = await this.buildDescribe4PageMeta(pageMeta);

    for (const plugin of this.plugins) {
      if (plugin.processPage) {
        pageDescribe = await plugin.processPage(pageDescribe);
      }
    }

    return pageDescribe;
  }

  public async invoke4Component(componentMeta: IComponentMeta4DeBuild) {
    let componentDescribe = await this.buildDescribe4ComponentMeta(componentMeta);

    for (const plugin of this.plugins) {
      if (plugin.processComponent) {
        componentDescribe = await plugin.processComponent(componentDescribe);
      }
    }

    return componentDescribe;
  }

  public async invoke4App(appMeta: IAppMeta4DeBuild): Promise<IDeBuildPluginAppDescribe> {
    /**
     * 不做任何参数安全检查，崩了算上下游的。
     */
    let appDescribe = await this.buildDescribe4AppMeta(appMeta);
    for (const plugin of this.plugins) {
      if (plugin.processApp) {
        appDescribe = await plugin.processApp(appDescribe);
      }
    }

    return appDescribe;
  }

  public async generateCodeFromDescribe4ExtraAXML(axmlDescribe: TDeBuildPluginFile4AXML) {
    return axmlGenerate(axmlDescribe.ast);
  }

  public async generateCodeFromDescribe4ExtraACSS(acssDescribe: TDeBuildPluginFile4ACSS) {
    return acssGenerate(acssDescribe.ast);
  }

  public async generateCodeFromDescribe4ExtraJS(jsDescribe: TDeBuildPluginFile4JS) {
    return jsGenerator(jsDescribe.ast);
  }

  public async generateCodeFromDescribe4Page(pageDescribe: IDeBuildPluginPageDescribe) {
    const result: { acss?: string; js?: string; json?: string; axml?: string } = {};

    const acssFile = pageDescribe.acssFile;
    if (acssFile) {
      result.acss = acssGenerate(acssFile.ast);
    }

    const jsFile = pageDescribe.jsFile;
    if (jsFile) {
      result.js = jsGenerator(jsFile.ast);
    }

    const jsonFile = pageDescribe.jsonFile;
    if (jsonFile) {
      result.json = JSON.stringify(jsonFile.ast, null, 2);
    }

    const axmlFile = pageDescribe.axmlFile;
    if (axmlFile) {
      result.axml = axmlGenerate(axmlFile.ast);
    }

    return result;
  }

  public async generateCodeFromDescribe4Component(componentDescribe: IDeBuildPluginComponentDescribe) {
    const result: { acss?: string; js?: string; json?: string; axml?: string } = {};
    const { acssFile, jsFile, jsonFile, axmlFile } = componentDescribe;

    if (acssFile) {
      result.acss = acssGenerate(acssFile.ast);
    }

    if (jsFile) {
      result.js = jsGenerator(jsFile.ast);
    }

    if (jsonFile) {
      result.json = JSON.stringify(jsonFile.ast, null, 2);
    }

    if (axmlFile) {
      result.axml = axmlGenerate(axmlFile.ast);
    }

    return result;
  }

  public generateCodeFromDescribe4App(describe: IDeBuildPluginAppDescribe) {
    const result: { acss?: string; js?: string; json?: string } = {};

    const acssFile = describe.acssFile;
    if (acssFile) {
      result.acss = acssGenerate(acssFile.ast);
    }

    const jsFile = describe.jsFile;
    if (jsFile) {
      result.js = jsGenerator(jsFile.ast);
    }

    const jsonFile = describe.jsonFile;
    if (jsonFile) {
      result.json = JSON.stringify(jsonFile.ast, null, 2);
    }

    return result;
  }

  private async buildDescribe4PageMeta(pageMeta: IPageMeta4DeBuild): Promise<IDeBuildPluginPageDescribe> {
    const pageDescribe: IDeBuildPluginPageDescribe = {
      pagePath: pageMeta.pagePath,
    };

    const acssFile = pageMeta.pageACSS;
    if (acssFile) {
      pageDescribe.acssFile = {
        ...acssFile,
        ast: acssParse(acssFile.fileContent, acssFile.filePath),
      };
    }

    const jsFile = pageMeta.pageJS;
    if (jsFile) {
      pageDescribe.jsFile = {
        ast: await jsParse(jsFile.fileContent, this.appxRootPath, jsFile.filePath),
        ...jsFile,
      };
    }

    const jsonFile = pageMeta.pageJSON;
    if (jsonFile) {
      pageDescribe.jsonFile = {
        ast: jsonParse(jsonFile.fileContent, jsonFile.filePath),
        ...jsonFile,
      };
    }

    const axmlFile = pageMeta.pageAXML;
    if (axmlFile) {
      pageDescribe.axmlFile = {
        ast: axmlParse(axmlFile.fileContent, axmlFile.filePath),
        ...axmlFile,
      };
    }

    return pageDescribe;
  }

  private async buildDescribe4ComponentMeta(componentMeta: IComponentMeta4DeBuild): Promise<IDeBuildPluginComponentDescribe> {
    const { componentPath, componentAXML: axmlFile, componentJSON: jsonFile, componentJS: jsFile, componentACSS: acssFile } = componentMeta;

    const describe: IDeBuildPluginComponentDescribe = {
      componentPath,
    };

    if (acssFile) {
      describe.acssFile = {
        ...acssFile,
        ast: acssParse(acssFile.fileContent, acssFile.filePath),
      };
    }

    if (jsFile) {
      describe.jsFile = {
        ast: await jsParse(jsFile.fileContent, this.appxRootPath, jsFile.filePath),
        ...jsFile,
      };
    }

    if (jsonFile) {
      describe.jsonFile = {
        ast: jsonParse(jsonFile.fileContent, jsonFile.filePath),
        ...jsonFile,
      };
    }

    if (axmlFile) {
      describe.axmlFile = {
        ast: axmlParse(axmlFile.fileContent, axmlFile.filePath),
        ...axmlFile,
      };
    }

    return describe;
  }

  private async buildDescribe4ExtraACSS(extraACSS: IDeBuildPluginFile): Promise<TDeBuildPluginFile4ACSS> {
    const acssAST = acssParse(extraACSS.fileContent, extraACSS.filePath);
    return {
      ...extraACSS,
      ast: acssAST,
    };
  }

  private async buildDescribe4ExtraJS(extraJS: IDeBuildPluginFile): Promise<TDeBuildPluginFile4JS> {
    const jsAST = await jsParse(extraJS.fileContent, this.appxRootPath, extraJS.filePath);
    return {
      ast: jsAST,
      ...extraJS,
    };
  }
  private async buildDescribe4ExtraAXML(extraAXML: IDeBuildPluginFile): Promise<TDeBuildPluginFile4AXML> {
    const ast = axmlParse(extraAXML.fileContent, extraAXML.filePath);
    return {
      ast,
      ...extraAXML,
    };
  }

  private async buildDescribe4AppMeta(appMeta: IAppMeta4DeBuild): Promise<IDeBuildPluginAppDescribe> {
    const appDescribe: IDeBuildPluginAppDescribe = {};

    const appJS = appMeta.appJS;
    if (appJS) {
      appDescribe.jsFile = {
        ast: await jsParse(appJS.fileContent, this.appxRootPath, appJS.filePath),
        fileContent: appJS.fileContent,
        filePath: appJS.filePath,
      };
    }

    const appACSS = appMeta.appACSS;
    if (appACSS) {
      appDescribe.acssFile = {
        ast: acssParse(appACSS.fileContent, appACSS.filePath),
        fileContent: appACSS.fileContent,
        filePath: appACSS.filePath,
      };
    }

    const appJSON = appMeta.appJSON;
    if (appJSON) {
      appDescribe.jsonFile = {
        ast: jsonParse(appJSON.fileContent, appJSON.filePath),
        fileContent: appJSON.fileContent,
        filePath: appJSON.filePath,
      };
    }

    return appDescribe;
  }
}
