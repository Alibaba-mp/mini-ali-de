import chalk from 'chalk';
import Debug, { IDebugger } from 'debug';
import { ISharedCLILogger } from './interface';

// const logger = Debug('CUBE');
// export function logDebug(...args: string[]) {
//   logger(['', ...args]);
// }

interface ISharedCLILoggerState {
  startTime: number;
}

function timing(state: ISharedCLILoggerState) {
  return chalk.green(` +${((Date.now() - state.startTime) / 1000).toFixed(2)}s `);
}

function sharedLog(state: ISharedCLILoggerState, type: 'yellow' | 'blue' | 'red' | 'grey', name: string, ...args: string[]) {
  console.log(`${chalk[type](`[${name}]`)}`, ...args); // tslint:disable-line
}

function sharedDebug(state: ISharedCLILoggerState, logger: IDebugger, name: string, ...args: string[]) {
  logger('', ...args.map(d => chalk.gray(d)));
}

function sharedError(state: ISharedCLILoggerState, name: string, error: Error, message: string) {
  console.log(`${chalk.red(`[${name}]`)}`, message); // tslint:disable-line
  console.error(error); // tslint:disable-line
}

function sharedWrite(state: ISharedCLILoggerState, ...args: string[]) {
  console.log(...args); // tslint:disable-line
}

const loggerMap: Record<string, ISharedCLILogger> = Object.create(null);

export function getLogger(name: string) {
  if (!loggerMap[name]) {
    const debugLogger = Debug(`cube${name}`);
    const state: ISharedCLILoggerState = {
      startTime: Date.now(),
    };
    loggerMap[name] = Object.freeze({
      debug: sharedDebug.bind(null, state, debugLogger, name),
      error: sharedError.bind(null, state, name),
      info: sharedLog.bind(null, state, 'blue', name),
      warn: sharedLog.bind(null, state, 'yellow', name),
      write: sharedWrite.bind(null, state),
    });
  }
  return loggerMap[name];
}
