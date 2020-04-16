import * as fs from 'fs';
import * as path from 'path';
import util from 'util';

interface IDeJsonConfig {
  plugins: Array<[string, any]>;
  less: boolean;
  typescript: boolean;
}

export const DeJsonFileName = '.de-config.json';
export const DeJSFileName = 'de.config.js';
export const DeJsonDefaultConfig: IDeJsonConfig = {
  less: false,
  plugins: [],
  typescript: false,
};

export const parseDeJsonConfig = (json: string | IDeJsonConfig): IDeJsonConfig => {
  try {
    let jsonParsed: IDeJsonConfig;
    if (typeof json === 'string') {
      jsonParsed = JSON.parse(json);
    } else {
      jsonParsed = json;
    }

    return {
      less: !!jsonParsed.less,
      plugins: jsonParsed.plugins || DeJsonDefaultConfig.plugins,
      typescript: !!jsonParsed.typescript,
    };
  } catch (err) {
    return DeJsonDefaultConfig;
  }
};

async function isExists(filepath: string) {
  return await util.promisify(fs.exists)(filepath);
}

async function getFileContentByPaths(filepaths: string[]) {
  for (const filepath of filepaths) {
    const isFileExist = await isExists(filepath);
    if (isFileExist) {
      const content = await util.promisify(fs.readFile)(filepath, { encoding: 'utf-8' });
      return content;
    }
  }
}

export const getDeJsonConfig = async (entry: string, cwd: string): Promise<IDeJsonConfig> => {
  const DeJSFilePath = path.resolve(cwd, `./${DeJSFileName}`);
  const isE = await isExists(DeJSFilePath);
  if (isE) {
    return {
      ...DeJsonDefaultConfig,
      ...require(DeJSFilePath),
    };
  }

  const fileContent = await getFileContentByPaths([path.resolve(cwd, `./${DeJsonFileName}`), path.resolve(entry, `./${DeJsonFileName}`)]);
  return parseDeJsonConfig(fileContent);
};
