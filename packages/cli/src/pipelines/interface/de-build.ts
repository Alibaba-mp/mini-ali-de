import { webpack } from '@de2/build';
import { IDePipe } from '@de2/cli-shared';
import webpackMerge = require('webpack-merge');

export interface IDeBuildPipeInputArgs {
  deConfig: IDeBuildConfig;
  webpackConfig: webpack.Configuration;
  mergeWebpackConfig: typeof webpackMerge;
}

export type IDeBuildWebpackConfigPipe = IDePipe<[IDeBuildPipeInputArgs], webpack.Configuration>;

export interface IDeBuildPipelineDeps extends Record<string, IDePipe<any, any>> {
  ts: IDeBuildWebpackConfigPipe;
  finalConfig: IDeBuildWebpackConfigPipe;
  less: IDeBuildWebpackConfigPipe;
  anyMock: IDeBuildWebpackConfigPipe;
}

export interface IDeBuildConfig {
  env: 'prod' | 'dev' | 'test';
  ts: boolean; // boolean
  less: boolean; // boolean
  input: string; // dirname
  output: string; // dirname
  plugins?: Array<[string, any]>;
}
