import chalk from 'chalk';

enum ErrorLevel {
  Error = 'Error',
  Warn = 'Warn',
  Info = 'Info',
}

type ArgType = string | number;

interface IErrorIndexFunction {
  0: () => Error;
  1: (i0: ArgType) => Error;
  2: (i0: ArgType, i1: ArgType) => Error;
  3: (i0: ArgType, i1: ArgType, i3: ArgType) => Error;
  4: (i0: ArgType, i1: ArgType, i3: ArgType, i4: ArgType) => Error;
  [index: number]: (i0?: ArgType, i1?: ArgType, i2?: ArgType, i3?: ArgType) => Error;
}

interface IMessageIndexFunction {
  0: () => string;
  1: (i0: ArgType) => string;
  2: (i0: ArgType, i1: ArgType) => string;
  3: (i0: ArgType, i1: ArgType, i3: ArgType) => string;
  4: (i0: ArgType, i1: ArgType, i3: ArgType, i4: ArgType) => string;
  [index: number]: (i0?: ArgType, i1?: ArgType, i2?: ArgType, i3?: ArgType) => string;
}

function formatTemplate(template: string, args: ArgType[]) {
  const regex = /{(\d+)}/g;
  const message = template.replace(regex, (arg0, arg1) => {
    const index = +arg1;
    if (isNaN(index)) {
      return arg1;
    }
    return args[index];
  });
  return message;
}

function getMessage<T extends number>(template: string): IMessageIndexFunction[T] {
  return (...args: any[]) => {
    return formatTemplate(template, args);
  };
}

function getError<k extends number>(level: ErrorLevel, code: number, template: string, pureMessage: boolean = false): IErrorIndexFunction[k] {
  return (...args: ArgType[]) => {
    let errorMessage = formatTemplate(template, args);
    if (!pureMessage) {
      switch (level) {
        case ErrorLevel.Error:
          errorMessage = `\r\n❌  错误码：${code}\r\n错误信息：${errorMessage}`;
          break;
        case ErrorLevel.Warn:
          errorMessage = `\r\n⚠️  警告码：${code}\r\n警告信息：${errorMessage}`;
          break;
        default:
          errorMessage = `\r\n🎺  提示信息：${errorMessage}`;
          break;
      }
    }
    return new Error(errorMessage);
  };
}

namespace ErrorCollection {
  let ErrorCode = 0;
  export const SHOULD_INIT_IN_EMPTY_DIR = getError<1>(ErrorLevel.Error, ErrorCode++, '应该在空文件夹初始化应用，但是当前文件夹中有' + chalk.red('{0}'));
  export const GET_META_ERROR = getError<3>(ErrorLevel.Error, ErrorCode++, '获取应用元信息(' + chalk.yellow('{0}') + ')时发生错误' + chalk.red('{1}') + '{2}');
}

namespace MessageCollection {
  export const CHOSE_TEMPLATE = getMessage<0>('选择模板');
  export const IS_IN_CURRENT_DIR = getMessage<1>('是否在当前文件夹(' + chalk.yellow('{0}') + ')初始化?');
  export const NEW_FOLDER_NAME = getMessage<0>('新建文件夹名称');
  export const CWD_CHANGE_TO_DIR = getMessage<1>('工作目录切换到' + chalk.green('{0}'));
  export const GETTING_TEMPLATE = getMessage<1>('正在获取' + chalk.green('{0}') + '...');
  export const GETTING_TEMPLATE_DONE = getMessage<0>('获取完成');
  export const DIR_ALREADY_EXIST = getMessage<1>('目标文件夹' + chalk.green('{0}') + '已存在, 不再新建');
  export const USE_LESS = getMessage<0>('是否启用less?');
  export const USE_TS = getMessage<0>('是否启用ts?');
  export const IS_INTERNAL = getMessage<0>('是否为内部开发者?');
}

export { MessageCollection, ErrorCollection };
