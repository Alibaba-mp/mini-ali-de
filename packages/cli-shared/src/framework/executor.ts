import * as path from 'path';
import { Command } from '../thirdparty';
import { IConstructor, spawnAsync } from './../utils';
import { ISharedCLIController } from './controller';

type TSharedCLIControllerInstance = ISharedCLIController<any, any>;
export interface ISharedCLIControllerConstructor extends IConstructor<TSharedCLIControllerInstance> {
  action: string;
  options: string[][];
}

export interface ISharedCLIExecutorChildOption {
  prefix?: string;
}

export class CLIExecutor {
  private controllers: Record<string, ISharedCLIControllerConstructor> = Object.create(null);
  private depMap: Record<string, string>;
  private program: Command;

  constructor(map: Record<string, string>) {
    this.depMap = map;
    this.program = require('commander');
    this.program.on('command:*', () => {
      // tslint:disable-next-line no-console
      console.error('Invalid command: %s\nSee --help for a list of available commands.', this.program.args.join(' '));
      process.exit(1);
    });

    Object.keys(map).forEach(key => {
      this.add(key, map[key]);
    });
  }

  public async runChild(action: string, cwd: string, argv: string[], options: ISharedCLIExecutorChildOption = {}): Promise<any> {
    // 这里面启动 spawn，参数过去
    // 由 spawn 内的代码进行 register 以及返回回传
    //
    return await spawnAsync(path.resolve(__dirname, './spawn/index.js'), [], {
      cwd,
      env: {
        CUBE_EXECUTOR_CHILD_PARAMS: JSON.stringify({
          action,
          argv,
          map: this.depMap,
        }),
      },
      prefix: typeof options.prefix === 'string' ? options.prefix : action,
    });
  }

  public hasAction(action: string) {
    return !!this.controllers[action];
  }

  public async runController(klass: ISharedCLIControllerConstructor, option: any) {
    const controller = new klass(option, this);

    let result;
    try {
      result = await controller.run();
    } catch (ex) {
      throw ex;
    } finally {
    }

    return result;
  }

  public runWithArgv(argv: string[]): void {
    this.program.parse(argv);
  }

  public async runWithAction(action: string, args: object): Promise<any> {
    const klass = this.controllers[action];
    this.runController(klass, args);
  }

  public add(name: string, klassPath: string) {
    let klass: ISharedCLIControllerConstructor;
    try {
      const requiredExport = require(klassPath);
      klass = requiredExport.default || requiredExport;
    } catch (ex) {
      throw new Error(`${name} registered fail`);
    }
    if (name !== klass.action) {
      throw new Error(`${name} should be registered as ${klass.action}`);
    }
    this.registerClass(klass);
  }

  private registerClass(klass: ISharedCLIControllerConstructor) {
    if (!klass.action) {
      throw new Error('can not register undefined action');
    }
    if (!this.controllers[klass.action]) {
      this.controllers[klass.action] = klass;
      /**
       * 注册到 commander 上
       */
      const commandWithAction = this.program.command(klass.action);
      const options = klass.options;
      for (const option of options) {
        commandWithAction.option(option[0], ...option.slice(1));
      }
      const that = this;
      commandWithAction.action(function(this: Command) {
        const option = this;
        option.cwd = process.cwd();
        that.runController(klass, option);
      });
    } else {
      throw new Error(`${klass.action} register conflict`);
    }
  }
}
