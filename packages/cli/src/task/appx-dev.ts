import { getLogger, ISharedCLIController } from '@de2/cli-shared';
import * as path from 'path';
import { invokeDeBuildProdPipe } from '../pipelines/de-build';
import { getDeJsonConfig } from '../utils/de-config';

interface ICommandAppxDevProperty {
  cwd: string;
  output?: string;
  input?: string;
}

interface ICommandAppxDevOption {
  absInput: string;
  absOutput: string;
  cwd: string;
}

export default class AppxDevController extends ISharedCLIController<ICommandAppxDevProperty, ICommandAppxDevOption> {
  public static options = [
    ['--input [input]', 'De 文件目录', './src'],
    ['--output [output]', '小程序文件输出mulu', './dist'],
  ];
  public static action = 'appx-dev';
  private logger = getLogger('appx-dev');
  public getOption(command: ICommandAppxDevProperty) {
    return {
      absInput: path.resolve(command.cwd, command.input || './src'),
      absOutput: path.resolve(command.cwd, command.output || './dist'),
      cwd: command.cwd,
    };
  }
  public async run() {
    const { absInput, absOutput, cwd } = this.option;
    const config = await getDeJsonConfig(absInput, cwd);
    await invokeDeBuildProdPipe({
      env: 'dev',
      input: absInput,
      less: config.less || true,
      output: absOutput,
      plugins: config.plugins,
      ts: config.typescript || true,
    });
  }
}
