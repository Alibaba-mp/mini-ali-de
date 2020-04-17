import { CLIExecutor } from '@de2/cli-shared';
import taskMap from '../task';

export async function runDispatch(argv: string[]): Promise<void> {
  // 启动一个主 executor
  // 根据 action 执行，action 里面能拿到 executor 执行之前注册的别的方法，不允许递归执行
  // 执行 Controller 时，存在栈

  const executor = new CLIExecutor(taskMap);
  executor.runWithArgv(argv);
}
