import {
  DeAppJsonLoaderPath,
  DeAxmlLoaderPath,
  DeComponentJSLoader,
  DeEmitLoaderPath,
  DeExtraACSSLoaderPath,
  DeJSLoaderPath,
  DePageJSLoader,
  DeRawLoader,
  DeRemoveSourceLoaderPath,
  IDeAxmlLoaderOptions,
  IDeComponentLoaderOption,
  IDeEmitLoaderOption,
  IDeExtraACSSLoaderOptions,
  IDeJSLoaderOption,
  IDePageJsLoaderOptions,
  kDeAppEntry,
  rDeAppEntry,
  rDeComponentEntry,
  rDePageEntry,
  webpack,
} from '@de2/build';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import path from 'path';
import { Compiler, loader } from 'webpack';
import { IDeBuildPipeInputArgs, IDeBuildWebpackConfigPipe } from '../interface';

export const finialConfigPipe: IDeBuildWebpackConfigPipe = (option: IDeBuildPipeInputArgs) => {
  const webpackConfig = option.webpackConfig;
  const merge = option.mergeWebpackConfig;
  const deConfig = option.deConfig;
  const entryAppConfigJSonPath = path.resolve(deConfig.input, 'app.json');

  const appLoaderConfig = {
    loader: DeAppJsonLoaderPath,
    options: {
      appxRootPath: deConfig.input,
    },
  };

  const extraACSSLoaderConfig = {
    loader: DeExtraACSSLoaderPath,
    options: {
      appxRootPath: deConfig.input,
    } as IDeExtraACSSLoaderOptions,
  };

  const extraAXMLLoaderConfig = {
    loader: DeAxmlLoaderPath,
    options: {
      appxRootPath: deConfig.input,
    } as IDeAxmlLoaderOptions,
  };

  const extraJSLoaderConfig = {
    loader: DeJSLoaderPath,
    options: {
      appxRootPath: deConfig.input,
    } as IDeJSLoaderOption,
  };

  const emitLoaderConfig = {
    loader: DeEmitLoaderPath,
    options: {
      appxRootPath: deConfig.input,
      distRootPath: deConfig.output,
    } as IDeEmitLoaderOption,
  };
  const removeSourceConfig = {
    loader: DeRemoveSourceLoaderPath,
  };

  const pageJsLoaderConfig = {
    loader: DePageJSLoader,
    options: {
      appxRootPath: deConfig.input,
    } as IDePageJsLoaderOptions,
  };

  const componentJsLoaderConfig = {
    loader: DeComponentJSLoader,
    options: {
      appxRootPath: deConfig.input,
    } as IDeComponentLoaderOption,
  };

  class IgnorePlugin {
    public apply(compiler: Compiler) {
      const id = this.constructor.name;
      compiler.hooks.compilation.tap(id, compilation => {
        compilation.hooks.normalModuleLoader.tap(id, (loaderContext: loader.LoaderContext, module) => {
          const { emitFile } = loaderContext;
          loaderContext.emitFile = (name, content, sourceMap) => {
            if (!loaderContext.context.startsWith(deConfig.input)) {
              return () => {};
            }
            return emitFile.call(module, name, content, sourceMap);
          };
        });
      });
    }
  }

  return merge(webpackConfig, {
    entry: entryAppConfigJSonPath + '?' + kDeAppEntry,
    module: {
      rules: [
        {
          oneOf: [
            {
              resourceQuery: rDeAppEntry,
              use: [appLoaderConfig],
            },
          ],
          test: /\.json$/,
        },
        {
          exclude: /node_modules/,
          oneOf: [
            {
              resourceQuery: rDePageEntry,
              use: [pageJsLoaderConfig],
            },
            {
              resourceQuery: rDeComponentEntry,
              use: [componentJsLoaderConfig],
            },
            {
              resourceQuery: rDeAppEntry,
              use: [],
            },
            {
              use: [removeSourceConfig, extraJSLoaderConfig],
            },
          ],
          test: /\.(s?j|t)s$/,
        },
        {
          test: /\.acss$/,
          use: [extraACSSLoaderConfig],
        },
        {
          test: /\.axml$/,
          use: [extraAXMLLoaderConfig],
        },
      ],
    },
    plugins: [
      new IgnorePlugin(),
      new CopyWebpackPlugin(
        [
          {
            from: deConfig.input,
            ignore: [
              'node_modules',
              'node_modules/**/*',
              '.entry/**/*',
              '.entry',
              '.happypack/**/*',
              '.happypack',
              '**/*.md',
              '**/*.json',
              '**/*.sjs',
              '**/*.js',
              '**/*.axml',
              '**/*.acss',
            ],
            to: deConfig.output,
          },
          {
            from: deConfig.input,
            test: /node_modules\//,
            to: deConfig.output,
          },
        ],
        {
          ignore: ['**/*.ts', '**/*.sass', '**/*.scss', '**/*.less'],
        }
      ) as any,
    ],
    resolve: {
      extensions: ['.ts', '.js', '.less', '.css', '.acss', '.json'],
    },
  });
};
