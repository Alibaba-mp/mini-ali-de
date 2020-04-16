import { IDeBuildPipeInputArgs, IDeBuildWebpackConfigPipe } from '../interface';

export const anyMockPipe: IDeBuildWebpackConfigPipe = (option: IDeBuildPipeInputArgs) => {
  const webpackConfig = option.webpackConfig;
  const merge = option.mergeWebpackConfig;
  return merge(webpackConfig, {});
};
