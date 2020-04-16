import { IConstructor, IDeBuildConfig, IDeBuildPlugin } from '../interface';

/**
 * @FIXME 代码结构需要优化
 * @param config
 */
export function normalizeDeBuildConfigToPlugins(config: IDeBuildConfig): IDeBuildPlugin[] {
  const plugins: IDeBuildPlugin[] = [];
  const pluginConfigs = config && config.plugins;
  if (!pluginConfigs) {
    return plugins;
  }
  for (const userConfig of pluginConfigs) {
    let pluginName: string = '';
    let pluginConfig: any;

    if (typeof userConfig === 'string') {
      pluginName = userConfig;
    } else {
      pluginName = userConfig[0];
      pluginConfig = userConfig[1];
    }

    let pluginKlass: IConstructor<IDeBuildPlugin>;
    try {
      if (typeof pluginName === 'function') {
        pluginKlass = pluginName;
      } else {
        pluginKlass = require(pluginName);
        if ((pluginKlass as any).__esModule) {
          pluginKlass = (pluginKlass as any).default;
        }
      }
    } catch (e) {
      throw new Error(`${pluginName} 插件装载失败，请检查依赖是否安装`);
    }

    const pluginInstance: IDeBuildPlugin = new pluginKlass();
    if (pluginInstance.init) {
      pluginInstance.init(pluginConfig);
    }
    plugins.push(pluginInstance);
  }

  return plugins;
}
