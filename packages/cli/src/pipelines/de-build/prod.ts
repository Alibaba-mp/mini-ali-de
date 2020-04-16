// tslint:disable no-console
import { webpack } from '@de2/build';
import { setupRuntime } from '@de2/build';
import { IDePipeline } from '@de2/cli-shared';
import { IDeBuildConfig } from '../interface';
import { invokeDeBuildConfigPipeline } from './config';

/**
 * 构建
 */
export class DeBuildProdPipeline implements IDePipeline<any, any, any> {
  public initPipe(deps: any) {}
  public async invokePipes(deBuildConfig: IDeBuildConfig) {
    const buildConfig = await invokeDeBuildConfigPipeline(deBuildConfig);
    /**
     * 跑 webpack
     */
    setupRuntime(
      {
        plugins: deBuildConfig.plugins || [],
      },
      deBuildConfig.input
    );
    webpack(buildConfig, (err, stats) => {
      if (err) {
        console.error(err);
        return;
      }

      console.log(
        stats.toString({
          chunks: false, // Makes the build much quieter
          colors: true, // Shows colors in the console
        })
      );
    });
  }
}

export async function invokeDeBuildProdPipe(deBuildConfig: IDeBuildConfig) {
  const build = new DeBuildProdPipeline();
  build.initPipe({});
  await build.invokePipes(deBuildConfig);
}
