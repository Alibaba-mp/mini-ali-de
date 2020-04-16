import inquirer = require('inquirer');
import { CLIExecutor, ISharedCLIExecutorChildOption } from './executor';
export interface IProgramProperty {
  cwd: string;
}

export abstract class ISharedCLIController<TProgramProperty extends IProgramProperty, TOption> {
  public static options: string[][] = [];
  public static action: string;

  public readonly property: TProgramProperty;
  public readonly option: TOption;
  private readonly executor: CLIExecutor | void;

  constructor(property: TProgramProperty, executor?: CLIExecutor) {
    this.property = property;
    this.option = this.getOption(property);
    this.executor = executor;
    this.init();
  }

  public init() {}

  public abstract async run(): Promise<any>;

  public abstract getOption(v: TProgramProperty): TOption;

  public info(...args: any[]) {
    console.log(...args);
  }

  protected async choseAnswer(message: string) {
    const nameKey = 'chose';
    const prompt = inquirer.createPromptModule();
    const question: inquirer.Question = {
      choices: ['appx', 'page', 'component'],
      message,
      name: nameKey,
      type: 'list',
    };
    const answer = await prompt(question);
    return answer[nameKey];
  }

  protected async makeSure(message: string) {
    const nameKey = 'confirm';
    const prompt = inquirer.createPromptModule();
    const question: inquirer.Question = {
      message,
      name: nameKey,
      type: 'confirm',
    };
    const answer = await prompt(question);
    return answer[nameKey];
  }

  protected async askQuestion(message: string, options?: any) {
    const nameKey = 'ask';
    const prompt = inquirer.createPromptModule();
    const question: inquirer.Question = {
      message,
      name: nameKey,
      type: 'input',
      ...options,
    };
    const answer = await prompt(question);
    return answer[nameKey];
  }

  protected async runTask(action: string, options: object) {
    if (!this.executor) {
      throw new Error('runChild need parent executor');
    }
    return await this.executor.runWithAction(action, options);
  }
  protected async runTaskAsChild(action: string, argv: string[], options: ISharedCLIExecutorChildOption = {}) {
    if (!this.executor) {
      throw new Error('runChild need parent executor');
    }
    return await this.executor.runChild(action, this.property.cwd, argv, options);
  }
}
