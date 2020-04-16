import chalk from 'chalk';
import * as cp from 'child_process';
import * as portfinder from 'portfinder';
import { getLogger } from './logger';

// tslint:disable-next-line:no-var-requires
const ps = require('ps-node');

export interface ISharedCLISpawnOptions {
  cwd?: string;
  env?: Record<string, string>;
  prefix: string;
}

function formatOutput(prefix: string, v: string | Buffer): string {
  const output = v instanceof Buffer ? v.toString() : String(v);
  const lines = output.split('\n');
  const prefixedLines = prefix ? lines.map(str => `${chalk.blue(`[${prefix}]`)} ${str}`) : lines;

  return prefixedLines.join('\n');
}

async function getInspectPort(): Promise<number> {
  const argvs = process.execArgv;
  let foundPort: number;
  for (const arg of argvs) {
    const match = arg.match(/(--inspect|--inspect-brk)(=(\d+))/);
    if (match) {
      foundPort = parseInt(match[3], 10);
      break;
    }
  }
  if (foundPort) {
    let port;
    try {
      port = await portfinder.getPortPromise({
        port: foundPort + 2,
        stopPort: foundPort + 10,
      });
    } catch (ex) {
      throw new Error('can not find debug port' + ex.message);
    }
    return port;
  } else {
    return 0;
  }
}

export async function spawnShellAsync(cmd: string, argv: string[], options: ISharedCLISpawnOptions) {
  const logger = getLogger(options.prefix);

  // const inspectPort = (Math.random()*6000 + 2000).toFixed(0); //await getInspectPort();

  return new Promise((resolve, reject) => {
    const subprocess = cp.spawn(cmd, argv, {
      cwd: options.cwd,
      env: options.env
        ? {
            FORCE_SUPPORTS_COLOR: 'true',
            ...options.env,
          }
        : process.env,
      shell: true,
      stdio: 'pipe',
    });

    subprocess.stdout.on('data', payload => {
      logger.write(formatOutput(options.prefix, payload));
    });
    subprocess.stderr.on('data', payload => {
      logger.write(formatOutput(options.prefix, payload));
    });
    subprocess.on('close', code => {
      if (code !== 0) {
        const err = new Error(`spawn fail(${code}):\n${cmd}\n`);
        reject(err);
      } else {
        resolve();
      }
    });
    subprocess.on('error', err => {
      reject(err);
    });
  });
}

export async function spawnAsync(cmd: string, argv: string[], options: ISharedCLISpawnOptions) {
  const childArgv = [];
  childArgv.push(cmd);
  if (argv.length) {
    childArgv.push(...argv);
  }
  return await spawnShellAsync(process.execPath, childArgv, options);
}

export async function psLookup(command: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    ps.lookup(
      {
        command,
      },
      (err: Error, resultList: any) => {
        if (err) {
          reject(err);
        }
        if (resultList.length) {
          resolve(resultList[0].command);
        } else {
          reject(new Error(`not found ${command} process`));
        }
      }
    );
  });
}
