import { getLogger, ISharedCLIController } from '@de2/cli-shared';
import * as path from 'path';

export default class PhoneController extends ISharedCLIController<any, any> {
  public static options = [['--url [url]', '小程序产物地址']];
  public static action = 'phone';
  private logger = getLogger('phone');
  public getOption(command: any) {
    return {
      absInput: path.resolve(command.cwd, command.input || './src'),
    };
  }
  public async run() {
    this.logger.info('start sim');
  }
}
