import { webpack } from '@de2/build';
import { IDePipeline } from '@de2/cli-shared';
import merge from 'webpack-merge';
import { IDeBuildConfig, IDeBuildPipeInputArgs, IDeBuildPipelineDeps, IDeBuildWebpackConfigPipe } from '../interface';
import { anyMockPipe, finialConfigPipe, lessPipe, tsPipe } from '../pipe-impls';

export class DeBuildConfigPipeline implements IDePipeline<IDeBuildPipelineDeps, [IDeBuildConfig], webpack.Configuration> {
  private tsPipe: IDeBuildWebpackConfigPipe;
  private lessPipe: IDeBuildWebpackConfigPipe;
  private anyMockPipe: IDeBuildWebpackConfigPipe;
  private finalConfigPipe: IDeBuildWebpackConfigPipe;

  public initPipe(deps: IDeBuildPipelineDeps) {
    this.tsPipe = deps.ts;
    this.lessPipe = deps.less;
    this.anyMockPipe = deps.anyMock;
    this.finalConfigPipe = deps.finalConfig;
  }
  /**
   * 发 pipes
   * @param deBuildConfig
   */
  public invokePipes(deBuildConfig: IDeBuildConfig) {
    const pipeInputArgs: IDeBuildPipeInputArgs = {
      deConfig: deBuildConfig,
      mergeWebpackConfig: merge,
      webpackConfig: {
        mode: 'none',
        output: {
          path: deBuildConfig.output,
        },
        watch: deBuildConfig.env === 'dev',
      },
    };
    if (deBuildConfig.ts) {
      // 防止用户返回 undefined
      pipeInputArgs.webpackConfig = this.tsPipe(pipeInputArgs) || pipeInputArgs.webpackConfig;
    }
    if (deBuildConfig.less) {
      pipeInputArgs.webpackConfig = this.lessPipe(pipeInputArgs) || pipeInputArgs.webpackConfig;
    }

    pipeInputArgs.webpackConfig = this.finalConfigPipe(pipeInputArgs) || pipeInputArgs.webpackConfig;

    return pipeInputArgs.webpackConfig;
  }
}

export async function invokeDeBuildConfigPipeline(deBuildConfig: IDeBuildConfig) {
  const pipeline = new DeBuildConfigPipeline();
  pipeline.initPipe({
    anyMock: anyMockPipe,
    finalConfig: finialConfigPipe,
    less: lessPipe,
    ts: tsPipe,
  });
  return await pipeline.invokePipes(deBuildConfig);
}
