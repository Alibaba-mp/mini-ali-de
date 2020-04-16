import { Configuration } from 'webpack';
import { smart } from 'webpack-merge';
import { DEBuildConfig } from './types';
import { r } from './utils';

// tslint:disable-next-line:no-var-requires
const { DeExtraACSSLoaderPath } = require('@de2/build/lib/loaders/acss-loader');
// tslint:disable-next-line:no-var-requires
const { rDeAppEntry } = require('@de2/build/lib/common');

function lessPipe(config: DEBuildConfig): Configuration {
  return smart(config.webpackConfig, {
    module: {
      rules: [
        {
          test: /\.less$/,
          // tslint:disable-next-line:object-literal-sort-keys
          oneOf: [
            {
              resourceQuery: rDeAppEntry,
              use: [r('raw-loader'), r('less-loader')],
            },
            {
              use: [
                {
                  loader: DeExtraACSSLoaderPath,
                  options: {
                    appxRootPath: config.deConfig.input,
                  },
                },
                r('less-loader'),
              ],
            },
          ],
        },
      ],
    },
  });
}

export = lessPipe;
