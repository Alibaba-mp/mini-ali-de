import { ISharedCLIController } from '@de2/cli-shared';
import { mkdir, readdir } from 'fs';
import path from 'path';
import { promisify } from 'util';
import { ErrorCollection, MessageCollection } from '../utils/collection';
import copyAndReplace from '../utils/custom-copy';
import getAnswers from '../utils/get-answers';

interface ICommandInitProperty {
  cwd: string;
  template?: string;
  path?: string;
  default?: boolean;
  less?: boolean;
  ts?: boolean;
  internal?: boolean;
}

interface ICommandInitOption {
  cwd: string;
  template: string;
  path: string | boolean;
  default: boolean;
  less: boolean;
  ts: boolean;
  internal: boolean;
}

const pmkdir = promisify(mkdir);
const preaddir = promisify(readdir);

export default class InitController extends ISharedCLIController<ICommandInitProperty, ICommandInitOption> {
  public static options = [
    ['--template [template]', '模板文件目录'],
    ['--path [path]', '指定目录'],
    ['--default', '采用默认替换变量'],
    ['--less', '使用Less'],
    ['--ts', '使用TS'],
    ['--internal', '内部开发者'],
  ];
  public static action = 'init';
  public getOption(command: ICommandInitProperty) {
    return {
      cwd: command.cwd,
      default: command.default ? true : false,
      less: command.less ? true : false,
      path: command.path,
      template: command.template,
      ts: command.ts ? true : false,
      // tslint:disable-next-line:object-literal-sort-keys
      internal: command.internal ? true : false,
    };
  }
  public async run() {
    /**
     * 选择模板
     */
    let templateName;
    if (!this.option.template) {
      templateName = await this.choseAnswer(MessageCollection.CHOSE_TEMPLATE());
    } else {
      templateName = this.option.template;
    }

    /**
     * 新建 appx 模版时，根据是否使用 ts/less，选择不同模版
     * 默认 ts+less，开发者自己改 ts/less 后缀名和 de-config.json 去关闭 ts/less
     */
    // if (templateName === 'appx') {
    //   let less;
    //   if (!this.option.less) {
    //     less = await this.makeSure(MessageCollection.USE_LESS());
    //   } else {
    //     less = this.option.less;
    //   }

    //   let ts = false;
    //   if (less) {
    //     if (!this.option.ts) {
    //       ts = await this.makeSure(MessageCollection.USE_TS());
    //     } else {
    //       ts = this.option.ts;
    //     }
    //   }
    //   templateName = less ? (ts ? 'tsless' : 'less') : templateName;
    // }

    /**
     * 新建 appx 模版时，根据是否为内部用户(默认为内部用户)，选择不同模版
     */
    // let internal = true;
    // if (!this.option.template) {
    //   internal = await this.makeSure(MessageCollection.IS_INTERNAL());
    // }
    const internal = false;
    if (internal) {
      templateName = '_' + templateName;
    }

    const srcDir = path.resolve(__dirname, '../../template/', templateName);

    /**
     * 是否在指定目录初始化
     */
    let destDir = this.option.cwd;
    let destDirName = path.basename(destDir);
    if (!this.option.path) {
      const answerToCurrentDir = await this.makeSure(MessageCollection.IS_IN_CURRENT_DIR(destDirName));
      /**
       * 如果不指定目录初始化，要求用户人工输入
       */
      if (!answerToCurrentDir) {
        destDirName = (await this.askQuestion(MessageCollection.NEW_FOLDER_NAME())) || 'new-folder';
        destDir = path.resolve(destDir, destDirName);
        try {
          await pmkdir(destDirName);
        } catch (e) {
          this.info('👌 ', MessageCollection.DIR_ALREADY_EXIST(destDirName));
        }
      }
    } else {
      if (typeof this.option.path === 'string') {
        destDirName = this.option.path;
        destDir = path.resolve(destDir, destDirName);
        try {
          await pmkdir(destDirName);
        } catch (e) {
          this.info('👌 ', MessageCollection.DIR_ALREADY_EXIST(destDirName));
        }
      }
    }
    this.info(MessageCollection.CWD_CHANGE_TO_DIR(destDir));

    /**
     * 判断是否为空文件夹
     */
    const fileList = await preaddir(destDir);
    if (fileList.length > 0) {
      throw ErrorCollection.SHOULD_INIT_IN_EMPTY_DIR(fileList.join(','));
    }

    /**
     * 复制模板文件
     */
    this.info('🚚 ', MessageCollection.GETTING_TEMPLATE(templateName));
    const answer = await getAnswers(srcDir, this.option.default);
    copyAndReplace(srcDir, destDir, { ...answer }, ['.meta.js']);
    this.info('✅ ', MessageCollection.GETTING_TEMPLATE_DONE());
  }
}
