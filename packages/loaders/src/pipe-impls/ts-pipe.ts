import fs from 'fs-extra';
import ts from 'typescript';
import { Configuration } from 'webpack';
import { smart } from 'webpack-merge';
import TSLoaderPlugin from '../plugins/ts';
import { DEBuildConfig } from './types';
import { r } from './utils';

function tsPipe(config: DEBuildConfig): Configuration {
  const { webpackConfig, ...rest } = config;
  const { input } = rest.deConfig;
  const tsConfigFile = ts.findConfigFile(input, ts.sys.fileExists);

  const options: any = {};

  if (tsConfigFile) {
    options.compilerOptions = fs.readJsonSync(tsConfigFile).compilerOptions;
  }

  return smart(webpackConfig, {
    module: {
      rules: [
        {
          enforce: 'pre',
          test: /\.ts$/,
          use: [
            {
              loader: r('ts-loader'),
              options,
            },
          ],
        },
      ],
    },
    plugins: [new TSLoaderPlugin()],
  });
}

export = tsPipe;
